# Expense Tracker

This app helps users track their expenses. Users can add, view, edit, delete, and filter expenses, and the data is saved in PostgreSQL.

## How to run

You need Node.js, npm, PostgreSQL, and VS Code. Use pgAdmin to set up the database and install the Live Server extension in VS Code. An internet connection is needed to load Bootstrap.

### Backend

1. Make sure PostgreSQL is running.
2. Open pgAdmin and create a database named `expense_tracker`.
3. Open Query Tool for this database and run the contents of `backend/expense_tracker.sql`. This creates the expenses table and adds sample data.

   **Run the schema only for initial setup. Running it again deletes the existing expenses and restores the sample data.**

4. Create a file named `.env` inside `backend`, or copy `.env.example` to `.env`. Use these settings:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=expense_tracker
DB_USER=postgres
DB_PASSWORD="your_password"
```

Replace `your_password` with your PostgreSQL password. Change the host, database port, or username if your setup is different.

5. Open a terminal in the main project folder and run:

```bash
npm install
 cd backend
npm.cmd start
```

If your terminal is already inside `backend`, skip `cd backend`.

If PowerShell blocks npm, use these commands inside `backend` instead:

```powershell
npm.cmd install
npm.cmd start
```

6. Open `http://localhost:3000/api/expenses`. You should see the expenses as JSON. Keep the backend terminal running while using the app.

### Frontend

1. Open the main project folder in VS Code.
2. In Extensions, install **Live Server** by Ritwick Dey if it is not installed.
3. In the file explorer, right-click `frontend/index.html` and choose **Open with Live Server**.
4. The app opens in the browser and loads expenses from the backend.

The frontend uses `http://localhost:3000/api/expenses`. If you change `PORT` in `.env`, update `API_URL` in `frontend/js/app.js` to match.

After changing backend code or `.env`, stop the server with **Ctrl + C** and start it again.

## Features

- [x] Add an expense with validation.
- [x] Delete an expense with confirmation.
- [x] Edit an expense in a Bootstrap modal.
- [x] Filter by category, with an All option.
- [x] Show summary cards: total amount, number of expenses, and highest expense.
- [x] Save data in a PostgreSQL database.
- [x] Reload expenses from the API after adding, editing, or deleting.
- [x] Show loading spinners and clear error messages.
- [x] Support desktop and mobile screens.
- [x] Use CSS Grid for the summary cards.
- [x] Switch between light and dark mode, with the preference saved in the browser.
The summary cards always use all expenses, even when the table is filtered.

## API routes

| Method | Route | Action |
| --- | --- | --- |
| GET | `/api/expenses` | Show all expenses |
| GET | `/api/expenses/:id` | Show one expense |
| POST | `/api/expenses` | Add an expense |
| PUT | `/api/expenses/:id` | Update an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |

Allowed categories: Food, Transport, Bills, Entertainment, and Other.

## Screenshots

### Desktop overview

![Desktop summary cards and add-expense form](screenshots/desktop-overview.png)

### Desktop expenses

![Expenses table with category filter and edit and delete buttons](screenshots/desktop-expenses.png)

### Mobile layout

The mobile screenshots were taken using the browser device emulator at a width of 393 pixels. On small screens, scroll the table horizontally to see all columns.

![Mobile header and stacked summary cards](screenshots/mobile-overview.png)

More screenshots:

- [Successful expense addition](screenshots/add-success.png)
- [Full list ending and footer](screenshots/desktop-table-footer.png)
- [Mobile add-expense form](screenshots/mobile-add-form.png)
- [Mobile expense table and category filter](screenshots/mobile-expenses.png)

Screenshots show test data from a running app. A new database starts with the sample data in `expense_tracker.sql`.

## What was the hardest part?

Getting the backend running was one of the parts I got stuck on. PowerShell blocked the npm command, and I also tried starting the server from the wrong folder. I solved these issues by using `npm.cmd` and running the commands inside `backend`, where `package.json` is located. Then I tested the API with Thunder Client before connecting the frontend.

## Submission

Include the `frontend` and `backend` folders, this README, and the screenshots. Keep `expense_tracker.sql`, `package.json`, `package-lock.json`, and an `.env.example` file with placeholder settings.

Do not include `.env` or `node_modules` in the submitted ZIP. Keep them in your local working copy.
