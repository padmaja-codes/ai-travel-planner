# 🌍 Trao — AI Travel Planner

An intelligent full-stack travel planning application that generates personalized day-by-day itineraries, budget estimates, packing lists, and hotel suggestions using Google Gemini AI.

---

## 🔗 Live Demo

- **Frontend:** https://ai-travel-planner-tad1.onrender.com
- **Backend API:** https://your-backend-url.onrender.com

---

## 📌 Project Overview

Trao is a multi-user AI travel planner where users can register, log in, and generate complete trip plans by simply providing their destination, number of days, budget preference, and interests. The AI agent (powered by Google Gemini 2.0 Flash) handles the rest — producing structured itineraries, cost breakdowns, hotel suggestions, and a smart packing list.

---

## 🛠️ Tech Stack

| Layer | Technology | Justification |
|---|---|---|
| Frontend | Next.js 14 + TypeScript | File-based routing, SSR support, and fast performance |
| Styling | Tailwind CSS | Utility-first CSS for rapid, responsive UI development |
| Backend | Node.js + Express | Lightweight, fast REST API with rich ecosystem |
| Database | MongoDB (Atlas) | Flexible schema ideal for varied itinerary structures |
| AI | Google Gemini 2.0 Flash | Fast, accurate structured JSON output for itinerary generation |
| Auth | JWT (JSON Web Tokens) | Stateless, scalable authentication |
| Deployment | Render | Simple, free-tier friendly deployment for both services |

---

## 🗂️ Project Structure

```
ai-travel-planner/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register & login logic
│   │   └── tripController.js      # AI generation & trip CRUD
│   ├── middleware/
│   │   └── auth.js                # JWT verification middleware
│   ├── models/
│   │   ├── User.js                # User schema
│   │   └── Trip.js                # Trip/itinerary schema
│   ├── routes/
│   │   ├── authRoutes.js          # /api/auth endpoints
│   │   └── tripRoutes.js          # /api/trips endpoints
│   └── server.js                  # Express app entry point
│
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx           # Landing page
        │   ├── login/page.tsx     # Login page
        │   ├── register/page.tsx  # Register page
        │   └── dashboard/page.tsx # User dashboard
        ├── components/
        │   ├── CreateTripForm.tsx  # Trip input form
        │   ├── ItineraryCard.tsx   # Day-by-day itinerary display
        │   └── PackingList.tsx     # AI-generated packing list
        ├── types/index.ts          # TypeScript type definitions
        └── utils/api.ts            # API call utilities
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com))

### 1. Clone the repository
```bash
git clone https://github.com/padmaja-codes/ai-travel-planner.git
cd ai-travel-planner
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:
```env
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
FRONTEND_URL=http://localhost:3000
```

Start the backend:
```bash
node server.js
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend/` folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:
```bash
npm run dev
```

Visit `http://localhost:3000`

---

## 🏗️ High-Level Architecture

```
User Browser
     │
     ▼
Next.js Frontend (Render)
     │  REST API calls with JWT
     ▼
Express Backend (Render)
     │              │
     ▼              ▼
MongoDB Atlas   Google Gemini API
(User & Trip    (Itinerary generation)
  storage)
```

- The frontend communicates with the backend via REST API using `NEXT_PUBLIC_API_URL`
- The backend validates requests using JWT middleware before any data access
- Trip generation calls Gemini 2.0 Flash with a structured prompt and parses the JSON response
- Each user's trips are stored in MongoDB with their `userId`, ensuring strict data isolation

---

## 🔐 Authentication & Authorization

- Users register with name, email, and password (password hashed with bcrypt)
- On login, the server issues a signed JWT token
- The token is stored in `localStorage` on the client
- Every protected API request includes the token in the `Authorization: Bearer <token>` header
- The `auth.js` middleware verifies the token and attaches `req.user` to the request
- All trip queries are filtered by `userId` — users can never access other users' data

---

## 🤖 AI Agent Design

The AI agent is built around a single, carefully engineered prompt sent to **Google Gemini 2.0 Flash** via its REST API.

### How it works:
1. User submits destination, number of days, budget tier, and interests
2. Backend constructs a detailed prompt requesting structured JSON output
3. Gemini returns a complete trip plan including:
   - Day-by-day itinerary with activities and time of day
   - Budget breakdown (flights, accommodation, food, activities)
   - Hotel suggestions (budget, mid-range, luxury)
   - Packing list by category
4. The response is parsed and saved to MongoDB
5. The frontend renders the structured data into cards

### Why Gemini 2.0 Flash?
- Supports `responseMimeType: 'application/json'` for clean structured output
- Fast response times suitable for real-time UX
- Free tier is generous enough for development and demo use

---

## ✨ Creative / Custom Feature — Smart Packing List

### What it is
Alongside the itinerary, the AI generates a personalized **packing list** categorized into Documents, Clothing, Gear, and Other — tailored to the destination, trip duration, budget tier, and selected interests.

### Why I built it
Most travel planners stop at the itinerary. But a real traveler's biggest anxiety is "did I forget something?" This feature extends the AI's usefulness beyond planning into actual trip preparation — making Trao a complete travel companion, not just an itinerary generator.

### Problem it solves
Instead of a generic checklist, the packing list is context-aware. An adventure trip to the mountains generates different items than a cultural city tour. A budget traveler gets different suggestions than a luxury traveler.

---

## 🎯 Key Design Decisions & Trade-offs

| Decision | Reasoning | Trade-off |
|---|---|---|
| Gemini over OpenAI | Free tier, structured JSON support | Less community tooling than OpenAI |
| JWT over sessions | Stateless, scales easily | Tokens can't be invalidated without a blocklist |
| MongoDB over SQL | Flexible schema for varied itineraries | Less rigid data consistency |
| Render over Vercel+Railway | Single platform for both services | Free tier spins down after inactivity (cold start ~30s) |
| Prompt returns full JSON | Predictable parsing, no hallucination in structure | Larger token usage per request |

---

## ⚠️ Known Limitations

- **Cold start delay:** Render's free tier spins down services after inactivity. First request after idle may take 30–60 seconds.
- **No token refresh:** JWT tokens expire and require the user to log in again — no silent refresh implemented.
- **No real hotel/flight data:** Hotel suggestions and budget estimates are AI-generated approximations, not live data from booking APIs.
- **Single branch deployment:** No staging environment — all changes deploy directly to production.

---

## 📬 Submission Details

- **GitHub:** https://github.com/padmaja-codes/ai-travel-planner
- **Live App:** https://ai-travel-planner-tad1.onrender.com
- **Developer:** Padmaja Chellaboina
