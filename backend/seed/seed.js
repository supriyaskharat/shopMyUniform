// seed/seed.js
// Populates the database with sample schools, products, a test user, and sample orders.
// Run with: npm run seed  (from the backend/ directory)
// WARNING: This will delete all existing data before inserting fresh seed data.

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');

const School   = require('../models/School');
const Product  = require('../models/Product');
const User     = require('../models/User');
const Order    = require('../models/Order');

// ─── Seed Data ────────────────────────────────────────────────────────────────

const schools = [
  { name: 'Delhi Public School', city: 'Delhi', grades: ['1','2','3','4','5','6','7','8','9','10','11','12'] },
  { name: 'Hyderabad Public School', city: 'Hyderabad', grades: ['1','2','3','4','5','6','7','8','9','10','11','12'] },
  { name: 'Kendriya Vidyalaya', city: 'Bangalore', grades: ['1','2','3','4','5','6','7','8','9','10','11','12'] },
];

// Helper to build product entries for a given school ID
const buildProducts = (schoolId) => [
  {
    name: 'Boys White Formal Shirt',
    category: 'shirt', gender: 'boys', school: schoolId,
    grades: ['1','2','3','4','5','6','7','8','9','10','11','12'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    price: 299, color: 'white',
    description: 'Full-sleeve formal white shirt for daily school wear.',
  },
  {
    name: 'Boys Navy Blue Trouser',
    category: 'trouser', gender: 'boys', school: schoolId,
    grades: ['6','7','8','9','10','11','12'],
    sizes: ['26', '28', '30', '32', '34'],
    price: 399, color: 'navy blue',
    description: 'Smart navy blue trousers with comfortable fit.',
  },
  {
    name: 'Boys Grey Shorts',
    category: 'shorts', gender: 'boys', school: schoolId,
    grades: ['1','2','3','4','5'],
    sizes: ['XS', 'S', 'M', 'L'],
    price: 249, color: 'grey',
    description: 'Comfortable grey shorts for junior school students.',
  },
  {
    name: 'Girls White Blouse',
    category: 'shirt', gender: 'girls', school: schoolId,
    grades: ['1','2','3','4','5','6','7','8','9','10','11','12'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    price: 279, color: 'white',
    description: 'Neat white blouse for girls, suitable for all grades.',
  },
  {
    name: 'Girls Navy Blue Skirt',
    category: 'skirt', gender: 'girls', school: schoolId,
    grades: ['6','7','8','9','10','11','12'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    price: 349, color: 'navy blue',
    description: 'Pleated navy blue skirt for senior school girls.',
  },
  {
    name: 'Girls Grey Pinafore',
    category: 'pinafore', gender: 'girls', school: schoolId,
    grades: ['1','2','3','4','5'],
    sizes: ['XS', 'S', 'M', 'L'],
    price: 349, color: 'grey',
    description: 'Classic grey pinafore for junior school girls.',
  },
  {
    name: 'School Blazer',
    category: 'blazer', gender: 'unisex', school: schoolId,
    grades: ['6','7','8','9','10','11','12'],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    price: 999, color: 'navy blue',
    description: 'Premium navy blue blazer with school emblem.',
  },
  {
    name: 'School Tie',
    category: 'tie', gender: 'unisex', school: schoolId,
    grades: ['1','2','3','4','5','6','7','8','9','10','11','12'],
    sizes: ['One Size'],
    price: 149, color: 'striped',
    description: 'Official school tie with house colour stripes.',
  },
];

// ─── Main Seed Function ────────────────────────────────────────────────────────

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear all existing data
    await School.deleteMany();
    await Product.deleteMany();
    await User.deleteMany();
    await Order.deleteMany();
    console.log('🗑️  Cleared existing data');

    // Insert schools
    const insertedSchools = await School.insertMany(schools);
    console.log(`🏫 Inserted ${insertedSchools.length} schools`);

    // Insert products for every school
    const allProducts = insertedSchools.flatMap((school) => buildProducts(school._id));
    const insertedProducts = await Product.insertMany(allProducts);
    console.log(`👕 Inserted ${insertedProducts.length} products`);

    // Create a test user linked to the first school (Delhi Public School)
    const testUser = await User.create({
      name: 'Rahul Sharma',
      email: 'test@example.com',
      password: 'password123', // hashed automatically by User model
      role: 'student',
      school: insertedSchools[0]._id,
      grade: '7',
    });
    console.log(`👤 Created test user: test@example.com / password123`);

    // Create sample orders for the test user
    const shirtProduct = insertedProducts.find((p) => p.name === 'Boys White Formal Shirt' && p.school.equals(insertedSchools[0]._id));
    const trouserProduct = insertedProducts.find((p) => p.name === 'Boys Navy Blue Trouser' && p.school.equals(insertedSchools[0]._id));

    await Order.create({
      user: testUser._id,
      items: [
        { product: shirtProduct._id, name: shirtProduct.name, size: 'M', quantity: 2, price: shirtProduct.price },
        { product: trouserProduct._id, name: trouserProduct.name, size: '30', quantity: 1, price: trouserProduct.price },
      ],
      totalAmount: shirtProduct.price * 2 + trouserProduct.price,
      status: 'shipped',
      shippingAddress: { name: 'Rahul Sharma', street: '12 MG Road', city: 'Delhi', state: 'Delhi', pincode: '110001', phone: '9876543210' },
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    });

    await Order.create({
      user: testUser._id,
      items: [
        { product: shirtProduct._id, name: shirtProduct.name, size: 'L', quantity: 1, price: shirtProduct.price },
      ],
      totalAmount: shirtProduct.price,
      status: 'delivered',
      shippingAddress: { name: 'Rahul Sharma', street: '12 MG Road', city: 'Delhi', state: 'Delhi', pincode: '110001', phone: '9876543210' },
      estimatedDelivery: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    });

    console.log('📦 Created 2 sample orders');
    console.log('\n✅ Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
