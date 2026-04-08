# Prompt Breaker

A web-based Capture The Flag (CTF) competition platform built for college tech fests. Teams compete by writing creative prompts to break AI agents out of their programmed behavior patterns.

## What is this

Prompt Breaker is a prompt engineering challenge where participating teams interact with 15 unique AI agents. Each agent has a specific behavioral quirk — one speaks only in haiku, another only in pirate language, another repeats every word twice. The team's goal is to craft a prompt clever enough to make the agent break its own rules and respond normally.

## Tech Stack

- **Frontend** — Next.js 14 (App Router), Tailwind CSS
- **Backend** — Next.js API Routes
- **Database** — PostgreSQL (Neon.tech)
- **Authentication** — NextAuth.js with Credentials Provider
- **AI** — OpenRouter API (Gemma 2 9B, Mistral 7B)
- **Deployment** — Vercel

## Features

- Team login system (no registration — organizer pre-registers teams)
- 15 AI agents across 3 difficulty tiers
- Real-time chat interface with persistent history per team per agent
- Automatic win detection using LLM-as-judge
- Points system (Easy 100pts / Medium 250pts / Hard 500pts)
- Live leaderboard ranked by score and solve time
- Admin dashboard to register teams, reset progress, monitor scores
- Rate limiting on submissions
- Mobile responsive dark glassmorphism UI

## Agent Tiers

| Tier | Points | Agents |
|------|--------|--------|
| Easy | 100 pts each | VERBOSE, CHEF-BOT, HAIKU-SAN, OPPOSITE-BOT, RHYME-BOT |
| Medium | 250 pts each | BINARY-BOT, SHAKESPEARE, EMOJI-BOT, PIRATE-BOT, WHISPER-BOT |
| Hard | 500 pts each | PARANOID, FORMAL-BOT, QUESTION-BOT, SHADOWSELF, THE ARCHITECT |

**Total possible score: 4,250 points**

## Project Structure
```
ctf-platform/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.js
│   │   ├── submit/route.js
│   │   ├── progress/route.js
│   │   ├── level/[id]/route.js
│   │   ├── chat/[levelId]/route.js
│   │   ├── admin/
│   │   │   ├── verify/route.js
│   │   │   ├── teams/route.js
│   │   │   └── teams/[id]/route.js
│   │   └── test-ai/route.js
│   ├── arena/
│   │   ├── layout.js
│   │   ├── page.js
│   │   └── [levelId]/page.js
│   ├── login/page.js
│   ├── leaderboard/page.js
│   ├── admin/page.js
│   └── layout.js
├── components/
│   ├── Sidebar.js
│   └── SessionProvider.js
├── lib/
│   └── db.js
├── scripts/
│   └── seed.js
├── middleware.js
├── .env.local
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18 or higher
- A Neon.tech account (free PostgreSQL database)
- An OpenRouter account (free AI API)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/ctf-platform.git
cd ctf-platform
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root of the project:
```env
DATABASE_URL=postgresql://user:pass@host/ctf?sslmode=require
NEXTAUTH_SECRET=your-random-32-character-string
NEXTAUTH_URL=http://localhost:3000
OPENROUTER_API_KEY=sk-or-v1-your-key-here
ADMIN_PASSWORD=your-admin-password
```

**Getting your keys:**
- `DATABASE_URL` — create a free project at neon.tech, copy the connection string
- `NEXTAUTH_SECRET` — run `openssl rand -base64 32` in your terminal
- `OPENROUTER_API_KEY` — create a free account at openrouter.ai and generate a key
- `ADMIN_PASSWORD` — choose any password for the organizer admin panel

### 4. Set up the database

Go to your Neon dashboard, open the SQL editor, and run:
```sql
CREATE TABLE teams (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id       VARCHAR(50) UNIQUE NOT NULL,
  team_name     VARCHAR(100) NOT NULL,
  password_hash TEXT NOT NULL,
  college       VARCHAR(150),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE levels (
  id              SERIAL PRIMARY KEY,
  tier            VARCHAR(10) NOT NULL,
  agent_name      VARCHAR(100) NOT NULL,
  objective_text  TEXT NOT NULL,
  system_prompt   TEXT NOT NULL,
  flag            VARCHAR(200) NOT NULL,
  order_index     INT UNIQUE NOT NULL,
  points          INT NOT NULL DEFAULT 100,
  win_condition   VARCHAR(50) NOT NULL DEFAULT 'flag_in_response',
  win_check_value TEXT
);

CREATE TABLE team_progress (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id       UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  level_id      INT NOT NULL REFERENCES levels(id),
  status        VARCHAR(20) DEFAULT 'locked',
  attempts      INT DEFAULT 0,
  points_earned INT NOT NULL DEFAULT 0,
  unlocked_at   TIMESTAMPTZ,
  solved_at     TIMESTAMPTZ,
  UNIQUE(team_id, level_id)
);

CREATE TABLE prompt_submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id      UUID NOT NULL REFERENCES teams(id),
  level_id     INT NOT NULL REFERENCES levels(id),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  prompt_text  TEXT NOT NULL,
  llm_response TEXT NOT NULL,
  flag_found   BOOLEAN DEFAULT FALSE
);

CREATE TABLE chat_history (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id    UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  level_id   INT NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
  role       VARCHAR(10) NOT NULL,
  message    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_history_team_level
ON chat_history(team_id, level_id, created_at ASC);
```

### 5. Seed the database
```bash
node scripts/seed.js
```

This creates 3 test teams and all 15 agents with their system prompts.

### 6. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Test login credentials

| Team ID | Password |
|---------|----------|
| TEAM_001 | password123 |
| TEAM_002 | password123 |
| TEAM_003 | password123 |

## Admin Panel

Visit `/admin` and enter your `ADMIN_PASSWORD` to access the organizer dashboard.

From the admin panel you can:
- View all registered teams and their scores
- Register new teams before the event
- Reset a team's progress
- Delete a team

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to vercel.com and import your repository
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Change `NEXTAUTH_URL` to your Vercel deployment URL
5. Click Deploy

### Seed the production database

After deploying, temporarily point your local `.env.local` to the production database URL and run:
```bash
node scripts/seed.js
```

Then switch `.env.local` back to your local database.

## Registering Teams for the Event

You can register real teams two ways:

**Option 1 — Admin panel UI**
Visit `/admin` → Register Team tab → fill in the form

**Option 2 — Direct SQL in Neon**
```sql
INSERT INTO teams (team_id, team_name, password_hash, college)
VALUES ('TEAM_042', 'Team Name', '$2b$10$...bcrypt-hash...', 'College Name');
```

After registering, unlock all levels:
```sql
INSERT INTO team_progress (team_id, level_id, status, unlocked_at)
SELECT t.id, l.id, 'unlocked', NOW()
FROM teams t CROSS JOIN levels l
WHERE t.team_id = 'TEAM_042'
ON CONFLICT (team_id, level_id) DO NOTHING;
```

## How the Win Detection Works

Each agent is judged by a second AI call that acts as a referee. When a team submits a prompt the platform:

1. Sends the team prompt to the bot with its secret system prompt
2. Gets the bot response
3. Sends both the bot rule and the bot response to a judge model
4. Judge returns YES (bot broke character) or NO (bot stayed in character)
5. If YES — level marked solved, points awarded, sidebar updates

## Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run seed     # Seed database with test teams and all 15 agents
```

## Environment Variables Reference

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string from Neon |
| `NEXTAUTH_SECRET` | Random secret for session encryption |
| `NEXTAUTH_URL` | Your app URL (localhost or Vercel URL) |
| `OPENROUTER_API_KEY` | API key from openrouter.ai |
| `ADMIN_PASSWORD` | Password for the organizer admin panel |

## License

MIT — free to use and modify for educational events.