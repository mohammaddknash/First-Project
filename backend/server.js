require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const app = express();
app.use(cors());
app.use(express.json());

//الـ Pool بدير مجموعة اتصالات بقاعدة البيانات، وبنعيد استخدام للاستعلامات. والقيم بنقرأها من .env باستخدامprocess.env.
const pool = new Pool({                  
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

function validateExpense(data) {
  const { title, amount, category, date } = data;
  // data.title =title.... (this is shortcut )

  if (
    typeof title !== "string" ||
    title.trim().length === 0 ||
    title.trim().length > 100
  ) {
    return "Title is required and must not exceed 100 characters";
  }

  if (
    typeof amount !== "number" ||
    !Number.isFinite(amount) ||
    amount < 0.01 ||
    amount > 99999999.99
  ) {
    return "Amount must be a number between 0.01 and 99999999.99";
  }

  const categories = [
    "Food",
    "Transport",
    "Bills",
    "Entertainment",
    "Other",
  ];

  if (!categories.includes(category)) {
    return "Please choose a valid category";
  }

  if (
    typeof date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    date.startsWith("0000")
  ) {
    return "Date must use the format YYYY-MM-DD";
  }

  const parsedDate = new Date(`${date}T00:00:00Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.toISOString().slice(0, 10) !== date
  ) {
    return "Please enter a valid calendar date";
  }

  return null;
}

app.get("/", (req, res) => {
  res.json({ message: "Expense Tracker API is running" });
});


app.get("/api/expenses", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        amount::float8 AS amount,
        category,
        to_char(date, 'YYYY-MM-DD') AS date
      FROM expenses
      ORDER BY id
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Failed to fetch expenses:", error.message);

    res.status(500).json({
      message: "Unable to load expenses",
    });
  }
});


app.get("/api/expenses/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0 || id > 2147483647) {
    return res.status(404).json({
      message: "Expense not found",
    });
  }

  try {
    const result = await pool.query(
      `SELECT
         id,
         title,
         amount::float8 AS amount,
         category,
         to_char(date, 'YYYY-MM-DD') AS date
       FROM expenses
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Failed to fetch expense:", error.message);

    res.status(500).json({
      message: "Unable to load expense",
    });
  }
});

app.post("/api/expenses", async (req, res) => {
  const data = req.body ?? {};
  const validationError = validateExpense(data);

  if (validationError) {
    return res.status(400).json({
      message: validationError,
    });
  }

  const { title, amount, category, date } = data;

  try {
    const result = await pool.query(
      `INSERT INTO expenses (title, amount, category, date)
       VALUES ($1, $2, $3, $4)
       RETURNING
         id,
         title,
         amount::float8 AS amount,
         category,
         to_char(date, 'YYYY-MM-DD') AS date`,
      [title.trim(), amount, category, date]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Failed to add expense:", error.message);

    res.status(500).json({
      message: "Unable to add expense",
    });
  }
});


app.put("/api/expenses/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0 || id > 2147483647) {
    return res.status(404).json({
      message: "Expense not found",
    });
  }

  const data = req.body ?? {};
  const validationError = validateExpense(data);

  if (validationError) {
    return res.status(400).json({
      message: validationError,
    });
  }

  const { title, amount, category, date } = data;

  try {
    const result = await pool.query(
      `UPDATE expenses
       SET title = $1,
           amount = $2,
           category = $3,
           date = $4
       WHERE id = $5
       RETURNING
         id,
         title,
         amount::float8 AS amount,
         category,
         to_char(date, 'YYYY-MM-DD') AS date`,
      [title.trim(), amount, category, date, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Failed to update expense:", error.message);

    res.status(500).json({
      message: "Unable to update expense",
    });
  }
});


app.delete("/api/expenses/:id", async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0 || id > 2147483647) {
    return res.status(404).json({
      message: "Expense not found",
    });
  }

  try {
    const result = await pool.query(
      "DELETE FROM expenses WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Expense not found",
      });
    }

    res.status(200).json({
      message: "Expense deleted successfully",
      id: result.rows[0].id,
    });
  } catch (error) {
    console.error("Failed to delete expense:", error.message);

    res.status(500).json({
      message: "Unable to delete expense",
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});







