# 🎮 Tic Tac Toe – Full Stack Web App (Next.js + Node.js + Supabase)

A beautiful and intelligent **Tic Tac Toe Game** built using **Next.js**, **Tailwind CSS**, **Node.js**, and **Supabase**.  
This game features user authentication, AI opponents (with the unbeatable **Minimax Algorithm**), replay & history tracking, and a clean modern UI.  

---

## 🚀 Features

### 🧩 Core Gameplay
- 🎯 **Classic Tic Tac Toe** board (3x3)
- 🧠 **AI Opponent** powered by **Minimax Algorithm**
  - Easy (Random)
  - Medium (Basic Strategy)
  - Hard (Unbeatable Minimax)
- 👥 **Two Player Mode** (Local Multiplayer)

### 🔐 Authentication
- Login & Sign Up with **Supabase Auth**
- Secure session management
- Logout functionality

### 📊 Game History & Replay
- Track all past games linked to each user
- View **move logs** in `(row, col)` format
- **Replay** past matches step-by-step
- **Time Travel** feature to review any move in history
- Personal **Scoreboard** showing wins, losses & draws

### 🎨 UI/UX
- Built using **Tailwind CSS**
- Responsive and mobile-friendly
- Dark mode with glowing **neon-blue theme**
- Smooth **Framer Motion animations**
- Interactive sound effects for moves and results

---

## 🧱 Tech Stack

| Layer | Technology Used |
|--------|-----------------|
| Frontend | Next.js (TypeScript), Tailwind CSS, Framer Motion |
| Backend | Node.js, Supabase (PostgreSQL) |
| Database | Supabase Postgres |
| Authentication | Supabase Auth |
| Deployment | Vercel (Frontend) + Supabase (Backend & DB) |

---

## 🗄️ Database Schema (Supabase SQL)

```sql
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner uuid REFERENCES profiles(id),
  difficulty text,
  mode text,
  result text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE moves (
  id bigserial PRIMARY KEY,
  game_id uuid REFERENCES games(id) ON DELETE CASCADE,
  player text,
  row int,
  col int,
  move_index int,
  created_at timestamptz DEFAULT now()
);


⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/<your-username>/tic-tac-toe-supabase.git
cd tic-tac-toe-supabase

2️⃣ Install Dependencies
npm install

3️⃣ Setup Environment Variables

Create a .env.local file in your root directory:

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key


⚠️ Don’t forget to add .env* files to .gitignore to keep your keys private.

4️⃣ Run the App
npm run dev


Then open: http://localhost:3000