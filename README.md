# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


### Web App

💧 **Hydration Tracker Web Application**
A user-friendly hydration tracker that helps individuals monitor and reach their daily water intake goals. Designed with accessibility, reminders, and simple visual feedback to promote healthier hydration habits.

🔍 **How It Works**
Sign Up / Log In: Users authenticate securely using Supabase.

Set Daily Goal: Users define how much water they want to drink each day.

Track Intake: Add water intake manually throughout the day.

Progress View: A visual progress bar shows how close you are to your goal.

Reminders: Browser notifications remind users to stay hydrated.

Data Storage: All data is saved in Supabase and persists across sessions.

✨ **Features**
🔒 Authentication via Supabase (Sign Up / Log In / Log Out)

📊 Progress Tracking with daily reset

🔔 Hydration Reminders via browser notifications

📱 Responsive Design for mobile and desktop

☁️ Persistent Data Storage using Supabase database

🎨 Simple & Clean UI with focus on user accessibility

🚀 **Deployment Instructions**

**Prerequisites**
-Node.js (v18 or later)
-npm or yarn
-Supabase project (for backend data storage and authentication)
-.env file for Supabase keys and config

🛠 **Supabase Setup**
To get the backend working with Supabase, the following steps were taken:
1. Create a Supabase Project
-Go to app.supabase.com and create a new project.
-Save the Project URL and Anon Public API Key.
2. Define the Database Schema
-Created a hydration_logs table with the following fields:

sql
CREATE TABLE hydration_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  date date NOT NULL,
  amount_ml integer NOT NULL,
  created_at timestamptz DEFAULT now()
);
3. Create Indexes

Optimized queries with these indexes:

sql
CREATE INDEX idx_user_date ON hydration_logs(user_id, date);
4. Set Row-Level Security (RLS) Policies
-Enabled RLS on the hydration_logs table:

ALTER TABLE hydration_logs ENABLE ROW LEVEL SECURITY;
Added policy to allow authenticated users to insert and view only their own data:

CREATE POLICY "Users can access their own hydration logs"
ON hydration_logs
FOR SELECT, INSERT, UPDATE, DELETE
USING (auth.uid() = user_id);
Authentication

Used Supabase Auth (email/password) to manage signups and logins.

Integrated @supabase/supabase-js client SDK on the frontend.

**Steps to Deploy**

1. Clone the Repository
bash
git clone https://github.com/your-username/hydration-tracker.git
cd hydration-tracker

2.Install Dependencies
bash
npm install
Environment Setup Create a .env file in the root directory and include:

3. Environment Setup API
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
PORT=3000

4. Run the App locally
bash
npm run dev
Access the App Open your browser and navigate to: http://localhost:3000

🧠 AI Usage & Citations
This project utilized AI tools to assist with development, design decisions, and content creation. The use of AI followed ethical standards and was cited accordingly.

Tools Used
ChatGPT by OpenAI (GPT-4 Turbo, April 2024 version)

Prompts Used
"Help write a GitHub README for a hydration tracker app that includes deployment instructions and AI usage citation."

"How to integrate a reminder system using React and browser notifications."

"How to connect a React app with Supabase for user authentication and storing hydration logs."

Components/Pages Affected
README.md structure and language

HydrationTracker.jsx - logic for tracking daily water goals

NotificationService.js - browser hydration reminders

supabaseClient.js - setup and integration with Supabase

AuthPage.jsx and Dashboard.jsx - user login and protected views
