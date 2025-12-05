✨ TipTracker – Full-Stack Web Application

TipTracker is a full-stack web application designed for restaurant servers to track their daily tips, hours worked, income summaries, and personal profile information.
This project is built using Node.js, Express, MongoDB, and Vanilla JavaScript with a clean, responsive frontend UI.

🚀 Features
🔐 Authentication

User registration

Login (plain-text passwords for MVP)

JWT-based authentication

Logout

Secure user data stored in MongoDB

👤 User Profile Management

View profile

Update hourly wage

Edit name/email

Change password (optional)

Delete account

💸 Tip Tracking

Add new tip entries

View all tips

Edit tip entries

Delete tip entries

Daily + monthly totals

Automatic dashboard statistics

📊 Dashboard Summary

Total tips earned

Total hours worked

Number of shifts

Auto-refresh button

🗂️ Tools & Technologies

Frontend: HTML, CSS, JavaScript

Backend: Node.js, Express

Database: MongoDB (local instance)

Authentication: JWT

Version Control: Git + GitHub

Agile Tooling: Jira/Trello (Product Backlog, Task Board)

📁 Project Structure
tip-tracker/
│
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── .env
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── tips.html
│   ├── edit-tip.html
│   ├── profile.html
│   ├── edit-profile.html
│   ├── app.js
│   └── styles.css
│
├── README.md
└── package.json

⚙️ Installation & Setup
1. Clone the Repository
git clone git@github.com:rozhinasaberi/tip-tracker.git
cd tip-tracker

2. Install Backend Dependencies
cd backend
npm install

3. Configure Environment Variables

Create a .env file inside /backend:

PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/tip-tracker
JWT_SECRET=supersecretjwttiptracker

4. Start Backend Server
node server.js


Backend runs at:
👉 http://localhost:4000

5. Start Frontend

From /frontend:

python3 -m http.server 5600


Frontend runs at:
👉 http://localhost:5600

🧪 Testing the Application

✔ Register a new account
✔ Log in
✔ Add a tip
✔ Edit/Delete tip
✔ Edit profile
✔ Update hourly wage
✔ Delete account
✔ Dashboard statistics auto-update



👩‍💻 Contributors

Rojina Saberi	Full-Stack Developer, UI Designer, GitHub Maintainer

This project is for academic use and coursework submission.
