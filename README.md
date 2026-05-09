# TipTracker

A full-stack web application that helps restaurant servers track daily tips, hours worked, shift totals, and income summaries.

## What This Project Is About

TipTracker was built to make it easier for servers to log tip entries, monitor earnings, and manage their profile information in one place. The project combines user authentication, CRUD operations, and dashboard-style summaries in a multi-page web app.

This is a **full-stack CRUD web application**.

## Key Features

- user registration and login
- JWT-based authentication
- create, view, edit, and delete tip entries
- dashboard totals for tips, hours, and shifts
- profile editing and hourly wage updates
- account deletion

## Tech Stack

- Node.js
- Express
- MongoDB
- HTML
- CSS
- Vanilla JavaScript
- JWT authentication

## Project Structure

- `backend/` - Express API, models, routes, middleware, controllers
- `frontend/` - static multi-page frontend
- `package.json` - project dependencies

## Important Note

The repository description on GitHub previously mentioned React, but the actual frontend in this repo is **Vanilla JavaScript**, not React.

## Run Locally

1. Install backend dependencies:

```bash
cd backend
npm install
```

2. Create a `.env` file in `backend/` with values similar to:

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/tip-tracker
JWT_SECRET=your_jwt_secret
```

3. Start the backend:

```bash
node server.js
```

4. Start the frontend from `frontend/`:

```bash
python3 -m http.server 5600
```

Then open:

- backend: `http://localhost:4000`
- frontend: `http://localhost:5600`

## Author

- Rojina Saberi
