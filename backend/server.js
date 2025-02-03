const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// SQLite Database Setup
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("Failed to connect to the database:", err.message);
  } else {
    console.log("Connected to SQLite database.");
  }
});

// Vulnerable Sign-In Endpoint
app.post("/signin", (req, res) => {
  const { username, password } = req.body;

  // Vulnerable SQL query
  const query = `
    SELECT * FROM Bank_users WHERE username = '${username}' AND password = '${password}'
  `;
  console.log("Executing query:", query);

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Query error:", err.message);
      res.status(500).json({ message: "Internal server error." });
    } else if (rows.length > 0) {
      res.status(200).json(rows); // Return fetched rows
    } else {
      res.status(401).json({ message: "Invalid username or password." });
    }
  });
});

// Sign-Up Endpoint
app.post("/signup", (req, res) => {
  const { username, password, name, address, balance, account_type } = req.body;

  // Check if username exists
  const checkQuery = `
    SELECT * FROM Bank_users WHERE username = '${username}'
  `;

  db.all(checkQuery, [], (err, rows) => {
    if (err) {
      console.error("Query error:", err.message);
      res.status(500).json({ message: "Internal server error." });
    } else if (rows.length > 0) {
      res.status(400).json({ message: "Username already exists." });
    } else {
      // Insert new user
      const insertQuery = `
        INSERT INTO Bank_users (username, password, name, address, balance, account_type)
        VALUES ('${username}', '${password}', '${name}', '${address}', ${balance}, '${account_type}')
      `;
      db.run(insertQuery, (err) => {
        if (err) {
          console.error("Insert error:", err.message);
          res.status(500).json({ message: "Internal server error." });
        } else {
          res.status(201).json({ message: "Sign-up successful!" });
        }
      });
    }
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
