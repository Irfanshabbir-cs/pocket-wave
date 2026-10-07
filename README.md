# Pocketwave

Personal finance app with real email-verified signup.

## Run it
1. Install Node 18+.
2. `npm install`
3. `cp .env.example .env` and fill it in (JWT_SECRET plus your SMTP details).
4. `npm start`, then open http://localhost:3000

Without SMTP settings the server prints each code in the terminal instead of emailing it.

## How sign-up works
1. Signup creates an unverified account and emails a 6-digit code (valid 10 minutes, 5 tries, 30s resend gap).
2. Entering the code verifies the email and logs the user in (30-day token).
3. Logging in with an unverified email sends a fresh code.
Passwords are hashed with bcrypt, codes are stored only as HMAC hashes, and the API is rate limited.

## Before going public
Use HTTPS, a real database instead of data/users.json, a verified sending domain (SPF/DKIM), and move finance data from the browser to the server.
Opening public/index.html without the server runs a demo mode that fakes the email on screen.
