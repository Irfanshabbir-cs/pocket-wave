# Pocketwave

Pocketwave is a personal finance dashboard with a sleek budgeting interface, goal tracking, and secure sign-up verification.

## Overview
Track spending, plan monthly budgets, monitor progress toward goals, and review your financial habits from one clean dashboard.

## Features
- Sign-up and login flow with verification code handling
- Local JSON-based user storage for easy testing
- Monthly budgets, goal tracking, and analytics panels
- Transaction entry sheet with income and expense tracking
- Dev mode that works without SMTP so you can test locally
- Rate-limited backend endpoints and password hashing

## Demo
Open the app locally and test the full flow:
- create a new account
- enter a 6-digit verification code
- log in to the dashboard
- create expenses/income entries

## Run locally
1. Install Node 18+
2. Open the project folder
3. Run `npm install`
4. Create a `.env` file with:
   ```env
   JWT_SECRET=dev_secret_change_me
   PORT=3000
   SMTP_HOST=
   SMTP_PORT=587
   SMTP_USER=
   SMTP_PASS=
   MAIL_FROM=Pocketwave <no-reply@localhost>
   ```
5. Run `npm start`
6. Open http://localhost:3000

## Local/dev mode
If SMTP is left blank, Pocketwave runs in local development mode:
- the verification code prints in the terminal
- any 6-digit code is accepted for testing
- this is useful while building or demoing without Gmail/SMTP

## Production deployment
Before shipping publicly, use:
- HTTPS
- a real database instead of `data/users.json`
- secure environment variables
- a verified email provider for real verification emails

## Tech stack
- Node.js
- Express
- JWT
- bcryptjs
- Nodemailer
- HTML, CSS, and JavaScript

## License
This project is licensed under the MIT License. See [LICENSE](LICENSE).

## Screenshots
See [screenshots.md](screenshots.md) for screenshot placeholders and recommended image names.
