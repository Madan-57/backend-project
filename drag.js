const express = require("express");
const PORT = 3002;
const { Client } = require("pg");


const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "madara",
  password: "madan123",
  port: 5432,
});


client.connect()
  .then(() => console.log("Connected to the database"))
  .catch(err => console.error("Database connection error:", err.stack));

const app = express();
app.use(express.json());


app.get("/hello", (req, res) => {
  res.status(200).json({ message: "Hello, World!" });
});


app.get("/GET", async (req, res) => {
  try {
    const result = await client.query("SELECT * FROM users;");
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/POST", async (req, res) => {
  const { id, name, phone, salary ,age ,state } = req.body;

 
  if (!id || !name || !phone || !salary || !age || !state) {
    return res.status(400).json({ error: "All fields (id, name, phone, salary, age ,state) are required." });
  }

  try {
    const result = await client.query(
      "INSERT INTO users (id, name, phone, salary, age ,state) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;",
      [id, name, phone, salary ,age ,state]
    );
    res.status(201).json({ message: "Item added successfully", item: result.rows[0] });
  } catch (error) {
    console.error("Error inserting item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, phone, salary, age, state } = req.body;

  if (!id || !name || !phone || !salary || !age || !state) {
    return res.status(400).json({ error: "All fields (id, name, phone, salary, age, state) are required." });
  }

  if (isNaN(salary) || isNaN(age)) {
    return res.status(400).json({ error: "Salary and age must be numeric values." });
  }

  try {
    const result = await client.query(
      "UPDATE users SET name = $1, phone = $2, salary = $3, age = $4, state = $5 WHERE id = $6 RETURNING *;",
      [name, phone, salary, age, state, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    res.status(200).json({ message: "User updated successfully", user: result.rows[0] });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal Server Error." });
  }
});





app.delete("/DEL/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  try {
    const result = await client.query("DELETE FROM users WHERE id = $1 RETURNING *;", [id]);
    if (result.rowCount === 0) {
      res.status(404).json({ error: "Item not found" });
    } else {
      res.status(200).json({ message: "Item deleted successfully", item: result.rows[0] });
    }
  } catch (error) {
    console.error("Error deleting item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});