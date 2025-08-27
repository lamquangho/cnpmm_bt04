# Fullstack Starter (Express + MongoDB, React + Vite)

This project was generated following the PDF guide you uploaded.

## Features included (starter)
- Backend (Express + Mongoose): register, login (JWT), forgot/reset password (demo), protected /api/home
- Frontend (Vite + React + Ant Design): pages for Register, Login, Home (protected)
- Axios instance with token injection

## How to run

1. Backend
   - Go to `/backend`
   - Copy `.env.example` to `.env` and set `MONGODB_URI` and `JWT_SECRET`
   - `npm install`
   - `npm run dev`

2. Frontend
   - Go to `/frontend`
   - `npm install`
   - `npm run dev`
   - By default frontend expects backend at `http://localhost:5000`. You can create `.env` with `VITE_API_URL=http://localhost:5000`

## Notes
- The forgot/reset endpoints return the reset token directly for demo. In production you must send emails and use single-use tokens.
- This is a starter. If you want, I can:
  - add email sending for forgot password,
  - add role-based auth,
  - add user profile, avatar upload,
  - dockerize the project,
  - convert frontend to TypeScript.
