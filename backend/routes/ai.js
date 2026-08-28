// routes/ai.js
// AI customer support agent powered by Google Gemini function calling.
// Gemini picks a tool based on the user's question, we run the real DB query,
// and send the result back so Gemini can answer with grounded data.

const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Tools Gemini can call, with the parameters each one accepts.
const tools = [
  {
    functionDeclarations: [
      {
        name: 'getProducts',
        description:
          'Search for school uniform products in the store. Use this when the user asks about product availability, sizes, categories, or prices.',
        parameters: {
          type: 'OBJECT',
          properties: {
            grade:     { type: 'STRING', description: 'Grade level, e.g. "7" or "10"' },
            category:  { type: 'STRING', description: 'shirt, trouser, skirt, blazer, tie, shoes, shorts, or pinafore' },
            gender:    { type: 'STRING', description: 'boys, girls, or unisex' },
            search:    { type: 'STRING', description: 'Text to search in product names' },
            schoolId:  { type: 'STRING', description: "MongoDB ObjectId of the user's school" },
          },
          required: [],
        },
      },
      {
        name: 'getMyOrders',
        description:
          "Get all orders placed by the currently logged-in user. Use this when the user asks about their order history or 'Where is my order?'",
        parameters: { type: 'OBJECT', properties: {}, required: [] },
      },
      {
        name: 'getOrderById',
        description: 'Get details of one specific order using its order number.',
        parameters: {
          type: 'OBJECT',
          properties: {
            orderNumber: { type: 'STRING', description: 'Order number like ORD-20240829-12345' },
          },
          required: ['orderNumber'],
        },
      },
      {
        name: 'getDeliveryInfo',
        description: 'Get information about delivery timelines, shipping costs, and coverage.',
        parameters: { type: 'OBJECT', properties: {}, required: [] },
      },
      {
        name: 'getReturnPolicy',
        description: 'Get information about how to return or exchange items.',
        parameters: { type: 'OBJECT', properties: {}, required: [] },
      },
    ],
  },
];

async function executeTool(toolName, args, userId, userSchoolId) {
  switch (toolName) {
    case 'getProducts': {
      const filter = {};
      if (args.grade)    filter.grades = String(args.grade);
      if (args.category) filter.category = String(args.category);
      if (args.gender)   filter.gender = String(args.gender);
      if (args.search)   filter.name = { $regex: String(args.search), $options: 'i' };

      // Use the user's school by default if no specific school was requested
      if (args.schoolId)      filter.school = String(args.schoolId);
      else if (userSchoolId)  filter.school = userSchoolId;

      const products = await Product.find(filter).populate('school', 'name').limit(10);

      if (products.length === 0) {
        return { found: false, message: 'No products found matching the criteria.' };
      }

      // Return a clean summary of each product for Gemini to use
      return products.map((p) => ({
        name: p.name,
        category: p.category,
        school: p.school?.name,
        gender: p.gender,
        grades: p.grades,
        sizes: p.sizes,
        price: `₹${p.price}`,
        color: p.color,
        inStock: p.stock > 0,
      }));
    }

    case 'getMyOrders': {
      const orders = await Order.find({ user: userId })
        .populate('items.product', 'name')
        .sort({ createdAt: -1 })
        .limit(5); // Show last 5 orders

      if (orders.length === 0) {
        return { found: false, message: 'No orders found for this user.' };
      }

      return orders.map((o) => ({
        orderNumber: o.orderNumber,
        status: o.status,
        totalAmount: `₹${o.totalAmount}`,
        estimatedDelivery: o.estimatedDelivery?.toDateString(),
        placedOn: o.createdAt?.toDateString(),
        items: o.items.map((i) => ({ name: i.name, size: i.size, quantity: i.quantity })),
      }));
    }

    case 'getOrderById': {
      const order = await Order.findOne({
        orderNumber: args.orderNumber,
        user: userId,
      });

      if (!order) {
        return { found: false, message: 'Order not found or does not belong to you.' };
      }

      return {
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: `₹${order.totalAmount}`,
        estimatedDelivery: order.estimatedDelivery?.toDateString(),
        shippingAddress: order.shippingAddress,
        items: order.items.map((i) => ({ name: i.name, size: i.size, quantity: i.quantity, price: `₹${i.price}` })),
      };
    }

    case 'getDeliveryInfo': {
      return {
        standardDelivery: '5–7 business days',
        expressDelivery: '2–3 business days (extra ₹99)',
        freeShipping: 'Free on orders above ₹999',
        coverage: 'All major cities in India',
        tracking: 'Order tracking available via My Orders page',
      };
    }

    case 'getReturnPolicy': {
      return {
        returnWindow: '7 days from delivery',
        exchangeWindow: '14 days from delivery',
        condition: 'Items must be unused, unwashed, with original tags',
        howToInitiate: 'Chat with us or email support@shopmyuniform.com',
        refundTimeline: '5–7 business days after item is picked up',
        sizeExchanges: 'Size exchanges are free of charge',
      };
    }

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

// POST /api/ai/chat — Send a message to the AI agent and get a response
router.post('/chat', protect, async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    // Get current user's info to personalise the AI context
    const user = await User.findById(req.user._id).populate('school', 'name');

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-3.6-flash',
      tools,
      systemInstruction: `You are a friendly and helpful customer support agent for ShopMyUniform, 
        an online school uniform store in India.
        Current user: ${user?.name || 'Customer'}, Grade: ${user?.grade || 'not specified'}, 
        School: ${user?.school?.name || 'not specified'}.
        Always use the provided tools to look up real data before answering.
        Never guess product availability, sizes, or order status — always check the database.
        Keep responses concise and friendly. Use ₹ for prices. Do not use emojis.
        Format structured details (order status, items, price) as a compact markdown
        bullet list — one "-" per field, no blank lines between bullets or between a
        heading and its list. Never put each field on its own paragraph.`,
    });

    // Gemini only accepts 'user' and 'model' roles — filter out any others.
    const contents = [
      ...(history || []).filter((e) => e.role === 'user' || e.role === 'model'),
      { role: 'user', parts: [{ text: message }] },
    ];

    let result = await model.generateContent({ contents });
    let response = result.response;

    // Keep calling tools until Gemini gives a final text reply
    while (response.functionCalls()?.length > 0) {
      const calls = response.functionCalls();

      contents.push({ role: 'model', parts: response.candidates[0].content.parts });

      const toolResultParts = await Promise.all(
        calls.map(async (call) => ({
          functionResponse: {
            name: call.name,
            response: {
              result: await executeTool(
                call.name,
                call.args,
                req.user._id,
                user?.school?._id?.toString()
              ),
            },
          },
        }))
      );

      contents.push({ role: 'user', parts: toolResultParts });
      result = await model.generateContent({ contents });
      response = result.response;
    }

    const reply = response.text();
    res.json({ success: true, data: { reply } });
  } catch (error) {
    console.error('AI chat error:', error.message);
    res.status(500).json({ success: false, message: 'AI service error. Please try again.' });
  }
});

module.exports = router;
