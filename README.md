# ShopMyUniform 🏫👕

A full-stack MERN e-commerce application for school uniform shopping, with an integrated **AI Customer Support Agent** powered by Google Gemini.

---

## Project Overview

ShopMyUniform lets students and parents browse school uniforms, place orders, and get instant support from an AI assistant that answers questions using live data from the database.

**Key Features:**
- 🔐 User registration & login (JWT-based)
- 🎓 Student/Parent profiles with school & grade selection
- 🛍️ Product catalog with search and filters (category, gender, grade)
- 🛒 Shopping cart with quantity management
- 📦 Order placement and order history
- 🤖 **AI Chat Agent** — Gemini 2.0 Flash with live database lookup (Function Calling)

---

## Technology Stack

### Frontend
- **React 19** — UI framework
- **React Router v6** — Client-side routing
- **Axios** — HTTP requests with JWT interceptor
- **Vite** — Build tool with dev proxy

### Backend
- **Node.js + Express.js** — REST API server
- **Mongoose** — MongoDB object modeling
- **bcryptjs** — Password hashing
- **jsonwebtoken** — JWT authentication
- **@google/generative-ai** — Gemini AI SDK

### Database
- **MongoDB Atlas** — Cloud-hosted database

### AI
- **Google Gemini 2.0 Flash** — LLM with Function Calling
- The AI calls real MongoDB queries before generating responses

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)
- Google Gemini API key ([get free key here](https://aistudio.google.com/app/apikey))

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd shopMyUniform
```

### 2. Set up the backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your actual values
```

### 3. Set up the frontend
```bash
cd ..  # back to project root
npm install
```

### 4. Seed the database
```bash
cd backend
npm run seed
```
This creates 3 schools, 24 products, and a test user (`test@example.com` / `password123`).

### 5. Run both servers

**Backend** (in one terminal):
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Frontend** (in another terminal):
```bash
# From project root
npm run dev
# App runs on http://localhost:5173
```

---

## Environment Variables

### `backend/.env`
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/shopmyuniform
JWT_SECRET=your_long_random_secret_key
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
FRONTEND_URL=http://localhost:5173
```

### Frontend (for production only — not needed for local dev)
```
VITE_API_URL=https://your-backend.onrender.com/api
```

---

## Database Structure

### Users
| Field | Type | Description |
|-------|------|-------------|
| name | String | Full name |
| email | String | Unique, lowercase |
| password | String | bcrypt hashed |
| role | String | `student` or `parent` |
| school | ObjectId | Ref to School |
| grade | String | e.g. `"7"` |

### Schools
| Field | Type | Description |
|-------|------|-------------|
| name | String | School name |
| city | String | Location |
| grades | [String] | e.g. `["1", "2", ..., "12"]` |

### Products
| Field | Type | Description |
|-------|------|-------------|
| name | String | Product name |
| category | String | shirt, trouser, skirt, blazer, etc. |
| school | ObjectId | Ref to School |
| gender | String | boys, girls, unisex |
| grades | [String] | Applicable grades |
| sizes | [String] | e.g. `["XS", "S", "M", "L"]` |
| price | Number | In Indian Rupees |
| color | String | Color name |

### Orders
| Field | Type | Description |
|-------|------|-------------|
| user | ObjectId | Ref to User |
| orderNumber | String | e.g. `ORD-20240829-12345` |
| items | [Object] | product, name, size, quantity, price |
| status | String | placed → processing → shipped → delivered |
| totalAmount | Number | Server-calculated (not from client) |
| shippingAddress | Object | name, street, city, state, pincode, phone |
| estimatedDelivery | Date | 7 days from order creation |

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Create account |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| PUT | `/api/auth/me` | ✅ | Update profile |

### Schools
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/schools` | ❌ | List all schools |
| GET | `/api/schools/:id` | ❌ | Single school |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | ❌ | List with filters: `?grade=7&category=shirt&gender=boys&search=white` |
| GET | `/api/products/:id` | ❌ | Single product |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/orders` | ✅ | My order history |
| POST | `/api/orders` | ✅ | Place new order |
| GET | `/api/orders/:id` | ✅ | Single order detail |

### AI
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/ai/chat` | ✅ | Chat with AI agent |

---

## AI Architecture

The AI agent uses **Gemini Function Calling** (Tool Use) — not predefined responses.

```
User Message
    ↓
Gemini 2.0 Flash
(with tool declarations)
    ↓ decides which tool to call
executeTool() runs MongoDB query
    ↓ returns real data
Gemini generates natural response
    ↓
User sees grounded answer
```

### Available AI Tools
| Tool | What it does |
|------|-------------|
| `getProducts` | Query products by school, grade, category, gender, or name |
| `getMyOrders` | Fetch the user's recent order history |
| `getOrderById` | Fetch details of a specific order |
| `getDeliveryInfo` | Return delivery timeline and shipping policies |
| `getReturnPolicy` | Return exchange and return policy |

**Example flow for "Where is my order?":**
1. User sends message from chat widget
2. Backend sends it to Gemini with tool declarations
3. Gemini calls `getMyOrders` tool
4. Backend queries `Order.find({ user: userId })` from MongoDB
5. Results sent back to Gemini
6. Gemini responds: *"Your latest order ORD-20240829-45678 is currently shipped and expected by Sept 5."*

---

## Deployment

### Backend → Render (Free tier)
1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Set Root Directory to `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add all environment variables from `.env.example`

### Frontend → Vercel
1. Import your GitHub repository on Vercel
2. Framework Preset: **Vite**
3. Add environment variable: `VITE_API_URL=https://your-app.onrender.com/api`
4. Deploy

---

## Test Account
After running `npm run seed`:
- **Email:** test@example.com
- **Password:** password123
- School: Delhi Public School, Grade: 7
- Has 2 sample orders (shipped + delivered)
