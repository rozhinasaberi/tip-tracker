# TipTracker Frontend (MVP)

This is a super simple HTML/CSS/JS frontend that talks to your existing **TipTracker** Node/Express/MongoDB backend.

It assumes your backend is running on:

- `http://localhost:4000`

and exposes the following routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/tips`
- `GET /api/tips`
- `PUT /api/tips/:id`
- `DELETE /api/tips/:id`

## How to use

1. Make sure your backend is running:

   ```bash
   cd tip-tracker
   npm run dev
   ```

2. Download/unzip this folder, then open `index.html` in your browser (you can just double-click it or open it with Live Server in VS Code).

3. Use the **Register** form to create a user, then **Login**.

4. Once logged in:
   - Create new tip entries.
   - Refresh tips.
   - Use **Quick +10$** to test update.
   - Use **Delete** to test delete.

The **Debug Console** at the bottom shows the raw JSON responses from the backend so you can take screenshots for your report and confirm everything is working.
