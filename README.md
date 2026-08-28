# ShopMyUniform

A full-stack MERN e-commerce application for school uniform shopping, with an integrated **AI Customer Support Agent** powered by OpenAI.

---

## Project Overview

ShopMyUniform lets students and parents browse school uniforms, place orders, and get instant support from an AI assistant that answers questions using live data from the database.

**Key Features:**
- User registration & login (JWT-based)
- Student/Parent profiles with school & grade selection
- Product catalog with search and filters (category, gender, grade)
- Shopping cart with quantity management
- Order placement and order history
- **AI Chat Agent** — OpenAI (gpt-4o-mini) with live database lookup (Function Calling), scoped to store topics only
- Responsive layout — usable on both desktop and mobile

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
- **openai** — OpenAI SDK

### Database
- **MongoDB Atlas** — Cloud-hosted database

### AI
- **OpenAI gpt-4o-mini** — LLM with Function Calling
- The AI calls real MongoDB queries before generating responses

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB)
- OpenAI API key ([get one here](https://platform.openai.com/api-keys))

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
OPENAI_API_KEY=your_openai_api_key
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

The AI agent uses **OpenAI Function Calling** (Tool Use) — not predefined responses.

```
User Message
    ↓
gpt-4o-mini
(with tool declarations)
    ↓ decides which tool to call
executeTool() runs MongoDB query
    ↓ returns real data
Model generates natural response
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
2. Backend sends it to OpenAI with tool declarations
3. Model calls `getMyOrders` tool
4. Backend queries `Order.find({ user: userId })` from MongoDB
5. Results sent back to the model
6. Model responds: *"Your latest order ORD-20240829-45678 is currently shipped and expected by Sept 5."*

### Guardrails
The assignment scopes the agent to products, sizes, delivery, orders, and returns/exchanges — so the system prompt enforces that scope explicitly:
- **Topic lock** — off-topic requests (e.g. "write me a Python function") get a polite decline instead of an answer, since an unscoped LLM behind a support widget is both off-brief and a support-cost/abuse risk.
- **Prompt-injection resistance** — the system prompt tells the model to ignore any instruction embedded in a user message that tries to override its role or these rules.
- **Grounded-only answers** — the model is told to always call a tool rather than guess; there's no path for it to state a product's availability, size, or an order's status from its own general knowledge.
- **Auth-scoped tools** — `getMyOrders`/`getOrderById` query `Order.find({ user: req.user._id })`, so the model can only ever see the logged-in user's own orders, never another user's.

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

The Login page also has a **Demo Login** button that signs in with this account directly, so a reviewer doesn't need to type credentials by hand.

---

## Code Quality & Architecture

Principles this codebase follows, and where to see them:

### KISS — keep it simple
- **Plain React Context** (`AuthContext`, `CartContext`) instead of Redux/Zustand — the app's state is small enough that a state management library would be pure overhead.
- **Cart lives in memory**, not persisted — acceptable for the assignment's scope and called out as a known limitation rather than engineered around.
- **No premature abstraction** — the five AI tools, the four route files, and the page components each do one thing directly; nothing is factored into a generic "handler builder" or similar layer that isn't needed yet.

### DRY — don't repeat yourself
- **Centralized error handling** — every route calls `next(error)` on failure instead of duplicating `try/catch` + `res.status(500).json(...)` boilerplate in each handler. One error-formatting middleware in `server.js` owns the response shape and keeps internal error details (e.g. raw Mongoose messages) from leaking to the client.
- **A single shared `axios` instance** (`src/api/axios.js`) carries the JWT-attach and 401-redirect logic once, instead of repeating auth headers and error handling at every call site.

### Separation of concerns
- Routes only orchestrate: parse the request, call Mongoose, shape the response. Business rules (password hashing, JWT signing) live in models/middleware, not scattered across routes.
- The AI route's tool declarations, tool executor, and the chat endpoint itself are three distinct pieces — the executor has zero knowledge of OpenAI's API shape, so swapping providers (this project moved from Gemini to OpenAI mid-build) only touched the request/response translation layer, not the tool logic.

### Security-by-default
- **Prices are always server-recomputed** from the database at order time (`orders.js`) — the client can never set what it pays.
- **Order ownership is enforced at the query level** (`Order.findOne({ _id, user: req.user._id })`), not checked after the fact.
- **Query-derived Mongo filters are type-coerced** (`String(...)`) before use, closing a NoSQL-injection surface where an object could be smuggled in through a query param.
- **AI tool access is scoped to the authenticated user** — see [Guardrails](#guardrails) above.

### Responsive & accessible UI
- Mobile breakpoints collapse the navbar into a hamburger menu, dock the AI chat widget to the screen edges, and stack cart/order rows instead of squeezing a desktop layout into a small viewport.
- Icons (`lucide-react`) are used instead of emoji throughout, for a consistent, theme-independent visual language.
