# 🎮 Tic Tac Toe – Full Stack Web App (Next.js + Node.js + Supabase)

A beautiful and intelligent **Tic Tac Toe Game** built using **Next.js**, **Tailwind CSS**, **Node.js**, and **Supabase**.  
This game features user authentication, AI opponents (with the unbeatable **Minimax Algorithm**), replay & history tracking, and a clean modern UI.  
# 🎮 Tic Tac Toe Game (HTML, CSS, JavaScript, TypeScript)

This is a **Tic Tac Toe Game** built using **HTML, CSS, JavaScript, and TypeScript**.  
It includes all **Must Have** and **Should Have** features according to the **MoSCoW prioritization method**.  
The game is designed to be simple, responsive, and fun to play! 😄

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
### 🟥 Must Have (Essential)
- ✅ 3x3 game board displayed using HTML & CSS  
- ✅ Two players: **X** and **O**  
- ✅ Turn switching after every move  
- ✅ **Win detection** (rows, columns, diagonals)  
- ✅ **Draw condition** when all cells are filled  
- ✅ Basic UI updates for moves  
- ✅ **Restart / Reset button** to start a new game  

### 🟧 Should Have (Important)
- ⭐ **Winning line highlight** when a player wins  
- ⭐ **Scoreboard** showing number of wins for each player  
- ⭐ **Responsive design** (works on desktop and mobile)  
- ⭐ **Player name input** feature  

---

## 🧠 Tech Stack

| Technology | Purpose |
|-------------|----------|
| **HTML5** | Structure of the game board |
| **CSS3** | Styling and layout |
| **JavaScript (ES6+)** | DOM manipulation and interactivity |
| **TypeScript** | Type safety and clean logic |

---

## 📂 Project Structure

TicTacToe/
│
├── index.html # Main HTML file
├── style.css # Styling for the game
├── src/
│ └── script.ts # TypeScript game logic
└── dist/
└── script.js # Compiled JavaScript

yaml
Copy code

---

## ⚙️ How to Run the Project

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Leadrat/Task-1_Pankaj.git
Open the Folder

bash
Copy code
cd Task-1_Pankaj
Compile TypeScript (if needed)

bash
Copy code
tsc src/script.ts --outDir dist
Open the Game

Open index.html in your browser

Start playing! 🎉

🏆 Future Enhancements
🤖 Add AI opponent for single-player mode

🌙 Add dark mode

🔊 Add sound effects for clicks and wins

🌐 Add online multiplayer feature
