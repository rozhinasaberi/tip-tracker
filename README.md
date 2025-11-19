TipTracker – Sprint 1 (MVP Release)

A simple web application that allows restaurant servers to track their daily tips, hours worked, and shift details.
This is the first release, focusing on backend functionality, full CRUD APIs, authentication, and a minimal working frontend.

🚀 Features (Sprint 1)

User Registration

User Login (JWT Authentication)

Protected API Routes

Create Tip Entry

Read Tip Entries

Delete Tip Entry

Update Tip Entry (available via API)

Connected MongoDB database

Simple HTML/JS frontend to interact with the backend

🧰 Tech Stack

Node.js + Express.js (Backend)

MongoDB + Mongoose (Database)

JWT (JSON Web Tokens) for authentication

HTML + CSS + JavaScript (Frontend)

Postman for API testing

📂 Project Structure
tip-tracker/
│
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
│
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── app.js
│
└── README.md

🛢 API Endpoints
Authentication
Method	Route	Description
POST	/api/auth/register	Register a new user
POST	/api/auth/login	Login + receive JWT
Tips (Protected)
Method	Route	Description
POST	/api/tips	Create a tip entry
GET	/api/tips	Get all tip entries for logged-in user
PUT	/api/tips/:id	Update a tip entry
DELETE	/api/tips/:id	Delete a tip entry

Authorization required:

Authorization: Bearer <token>

▶️ How to Run
1. Start backend
cd backend
npm install
npm run dev

2. Open frontend

Open frontend/index.html in your browser (or use Live Server).

🧪 Testing

All APIs were tested using Postman for:

Register

Login

Create Tip

Get Tips

Update Tip

Delete Tip

Unauthorized access (missing token)

📌 Notes

Passwords are stored as plain text for MVP demo purposes.

Frontend is intentionally simple for Sprint 1 (functionality over styling).

Update functionality is implemented in backend; UI update will be added in Sprint 2.
