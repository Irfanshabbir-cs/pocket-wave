# Pocketwave

Pocketwave is a personal finance dashboard with email-style verification for sign-up, local persistence, and a polished budgeting UI.

## Features
- Email verification flow for sign-up/login
- Local JSON-based user storage
- Budget, goals, stats, and monthly spending dashboard
- Demo/dev mode without SMTP for local testing
- Secure password hashing and rate-limited API routes

## Run locally
1. Install Node 18+
2. In the project folder, run `npm install`
3. Create a `.env` file with:
   ```env
   JWT_SECRET=dev_secret_change_me
   PORT=3000
   SMTP_HOST=
   SMTP_PORT=587
   SMTP_USER=
   SMTP_PASS=
   MAIL_FROM=Pocketwave <no-reply@localhost>
   ```
4. Run `npm start`
5. Open http://localhost:3000

## Local/dev mode
If SMTP values are left blank, the app runs in development mode:
- the server prints the generated verification code to the terminal
- any 6-digit code is accepted for verification during testing
- this makes it easy to test the app without Gmail or an SMTP provider

## Production notes
For deployment, use:
- HTTPS
- a real database instead of `data/users.json`
- a verified SMTP provider or email service
- stronger environment secret management

## Tech stack
- Node.js
- Express
- JWT
- bcryptjs
- Nodemailer
- vanilla HTML/CSS/JS frontend
