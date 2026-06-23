AI Travel Planner

A web app where you enter your destination, number of days, budget, and interests — and it generates a full travel plan for you using AI.

Live app: https://ai-travel-planner-tad1.onrender.com


What it does


Register and log in securely
Fill in your trip details
Get a day-by-day itinerary, budget estimate, hotel suggestions, and a packing list
Edit or regenerate any part of your trip



Tech used


Frontend: Next.js + Tailwind CSS
Backend: Node.js + Express
Database: MongoDB Atlas
AI: Google Gemini 2.0 Flash
Auth: JWT tokens
Deployed on: Render



Run it locally

Backend

bashcd backend
npm install

Create a .env file:

MONGODB_URI=your_mongodb_url
JWT_SECRET=any_secret_string
GEMINI_API_KEY=your_gemini_key
PORT=5000
FRONTEND_URL=http://localhost:3000

bashnode server.js

Frontend

bashcd frontend
npm install

Create a .env.local file:

NEXT_PUBLIC_API_URL=http://localhost:5000

bashnpm run dev

Open http://localhost:3000


How auth works

Users register with email and password. On login they get a JWT token which is saved in the browser. Every request to the backend sends that token in the header. The backend checks it before doing anything. Each user can only see their own trips.


How the AI works

When you submit your trip details, the backend sends a prompt to Google Gemini asking for a structured JSON response. Gemini returns the full itinerary, budget breakdown, hotel suggestions, and packing list in one shot. That data gets saved to MongoDB and shown on your dashboard.


My custom feature — Packing List

Most travel apps just give you an itinerary. I added an AI-generated packing list that's specific to your trip — your destination, how long you're going, and what you plan to do. An adventure trip gives different suggestions than a city tour. It's a small thing but genuinely useful.


Known issues


First load can be slow (Render free tier sleeps after inactivity)
Hotel prices and budgets are AI estimates, not real booking data
No password reset feature yet



GitHub

https://github.com/padmaja-codes/ai-travel-planner
