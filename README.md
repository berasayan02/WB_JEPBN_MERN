# WB JEPBN 2026 Mock Test — MERN Stack

Your original HTML/CSS/JS mock test app, rebuilt as a full MERN (MongoDB, Express,
React, Node) application with user accounts, Google login, server-side grading,
per-user score history, and an admin panel for managing questions.

All **3,102 questions** from your original 20 test sets (15 subjects + 5 PYQ papers,
2021–2025) were automatically extracted and converted — nothing was retyped by hand.

## What changed vs. the original

| Original (static) | MERN version |
|---|---|
| Questions hardcoded in each `script.js` | Stored in MongoDB, served via API |
| Correct answers visible in browser source | Correct answers never sent to the client until after submit — grading happens on the server |
| No login | Email/password login **and** "Continue with Google" |
| No score history | Every attempt is saved per-user (`/history`) |
| Editing a question meant editing HTML/JS | Admin Panel lets you add/edit/delete subjects & questions from the browser |
| `localStorage` theme toggle | Same dark mode toggle, now app-wide |

## Project structure

```
mern/
├── backend/          Express + MongoDB API (JWT auth, Google OAuth, test grading)
│   ├── models/        User, Subject, Question, TestResult
│   ├── routes/        auth, subjects, questions, tests
│   ├── controllers/
│   ├── middleware/     JWT protect + adminOnly
│   └── seed/           data/*.json (your converted questions) + seed.js + makeAdmin.js
└── frontend/         React (Vite) SPA
    └── src/
        ├── pages/       Login, Register, Dashboard, Test, History, Admin
        ├── context/     AuthContext, ThemeContext
        └── components/  Navbar, ProtectedRoute
```

## 1. Prerequisites

- Node.js 18+ and npm
- A MongoDB database — either:
  - **Local**: install MongoDB Community Server and run `mongod`, or
  - **Free cloud option**: create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and copy its connection string

## 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
- `MONGO_URI` — your local or Atlas connection string
- `JWT_SECRET` — any long random string (e.g. generate one with `openssl rand -hex 32`)
- `CLIENT_URL` — leave as `http://localhost:5173` for local dev
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` / `GOOGLE_CALLBACK_URL` — see **Google Login Setup** below

Load your question banks into the database:

```bash
npm run seed
```

This reads every file in `backend/seed/data/` (already generated from your original app)
and creates 20 Subjects + all their Questions in MongoDB. Safe to re-run any time —
it replaces existing questions for each subject rather than duplicating them.

Start the API:

```bash
npm run dev      # with auto-reload, or
npm start         # plain node
```

The API runs on `http://localhost:5000`.

## 3. Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`. Register an account (or use Google login) and start testing.

## 4. Google Login Setup

1. Go to the [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials).
2. Create a project (or pick an existing one).
3. Click **Create Credentials → OAuth Client ID**.
   - If prompted, configure the **OAuth consent screen** first (choose "External", fill in app name, your email, save).
4. Application type: **Web application**.
5. **Authorized JavaScript origins**: `http://localhost:5173`
6. **Authorized redirect URIs**: `http://localhost:5000/api/auth/google/callback`
7. Click Create — copy the **Client ID** and **Client Secret**.
8. Paste them into `backend/.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
9. Restart the backend (`npm run dev`).

Click **"Continue with Google"** on the login/register page to test it.

When you deploy to a real domain later, add your production URLs to the same
Google Cloud OAuth client (both the JS origin and the callback URL), and update
`CLIENT_URL` / `GOOGLE_CALLBACK_URL` in your production `.env`.

## 5. Creating your first admin account

Admin role can't be set from the UI (for security). After registering normally:

```bash
cd backend
node seed/makeAdmin.js your-email@example.com
```

Log out and back in — you'll now see an **Admin** link in the navbar to manage
subjects and questions.

## 6. How grading works (important)

The original app calculated your score entirely in the browser, with the correct
answers sitting in plain JavaScript anyone could open in DevTools. The MERN version
fixes this:

- `GET /api/tests/:slug/start` returns a random set of questions **without** `correctIndex`.
- The frontend collects your selected options and posts them to
  `POST /api/tests/:slug/submit`.
- The **server** looks up the real answers in MongoDB, grades everything
  (+1 correct, −0.25 wrong, same as your original app), and saves a `TestResult`.
- Only after this response comes back does the UI reveal which answers were right/wrong.

## 7. Deployment notes

- **Backend**: any Node host (Render, Railway, Fly.io, etc). Set the same env vars there,
  pointing `MONGO_URI` at your Atlas cluster and `CLIENT_URL` at your deployed frontend URL.
- **Frontend**: `npm run build` produces a `dist/` folder deployable to Vercel, Netlify, etc.
  Set `VITE_API_URL` to your deployed backend's `/api` URL.
- Don't forget to add your production URLs to the Google OAuth client's authorized
  origins/redirect URIs, or Google sign-in will fail with a redirect_uri_mismatch error.

## 8. Subjects included

15 subject-wise tests (50 random questions per attempt, 45-min timer, −0.25 negative
marking): Anatomy, Cardiovascular System, Community Health Nursing, Foundation of
Nursing, Medical Surgical Nursing, Microbiology, Nutrition, Obstetrical Nursing,
Pathology, Pediatric Nursing, Pharmacology, Physiology, Psychiatric Nursing,
Psychology, Sociology.

5 full-length PYQ papers (all questions each attempt): WB JEPBN 2021, 2022, 2023,
2024, 2025.
