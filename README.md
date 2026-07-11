# WB JEPBN Mock Test (MERN Stack)

A full-stack MERN web application designed for **WB JEPBN entrance exam preparation**. The platform provides subject-wise mock tests, previous year question (PYQ) papers, user authentication, score history, and an admin dashboard for managing questions.

## Features

- User Registration & Login (JWT Authentication)
- Google OAuth Login
- Subject-wise Mock Tests
- Previous Year Question Papers (2021–2025)
- Server-side Test Evaluation
- Negative Marking (-0.25)
- 45-minute Timer
- User Score History
- Dark / Light Theme
- Admin Dashboard
- Responsive Design
- MongoDB Database

## Tech Stack

### Frontend

- React (Vite)
- React Router
- Axios
- Context API
- CSS

### Backend

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- Passport Google OAuth 2.0

## Project Structure

```text
mern/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── context/
    │   ├── pages/
    │   ├── api/
    │   └── styles/
    └── vite.config.js
```

## Installation

### Clone Repository

```bash
git clone https://github.com/berasayan02/WB_JEPBN_MERN.git
cd WB_JEPBN_MERN/mern
```

---

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Update `.env`

```
MONGO_URI=
JWT_SECRET=
CLIENT_URL=http://localhost:5173

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=
```

Seed Database

```bash
npm run seed
```

Run Backend

```bash
npm run dev
```

---

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## Google OAuth Setup

1. Create OAuth Client in Google Cloud Console
2. Authorized JavaScript Origin

```
http://localhost:5173
```

3. Authorized Redirect URI

```
http://localhost:5000/api/auth/google/callback
```

Copy the generated credentials into `backend/.env`.

---

## Create Admin Account

After registering normally,

```bash
cd backend
node seed/makeAdmin.js your-email@example.com
```

Logout and login again.

---

## Test Flow

1. User selects a Subject / PYQ.
2. Questions are fetched from MongoDB.
3. Correct answers are hidden from the client.
4. User submits the test.
5. Backend evaluates answers.
6. Score is stored in MongoDB.
7. User can review previous attempts from History.

---

## Deployment

### Frontend

- Vercel

### Backend

- Render

### Database

- MongoDB Atlas

Remember to update:

- CLIENT_URL
- GOOGLE_CALLBACK_URL
- VITE_API_URL

before deploying.

---

## Subjects

- Anatomy
- Physiology
- Foundation of Nursing
- Medical Surgical Nursing
- Community Health Nursing
- Pediatric Nursing
- Obstetrical Nursing
- Psychiatric Nursing
- Pharmacology
- Nutrition
- Microbiology
- Pathology
- Psychology
- Sociology
- Cardiovascular System

### Previous Year Papers

- WB JEPBN 2021
- WB JEPBN 2022
- WB JEPBN 2023
- WB JEPBN 2024
- WB JEPBN 2025

---

## License

This project is developed for educational purposes.