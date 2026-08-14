const mysql = require("mysql")
const express = require("express")
const app = express()

app.get("/user", (req, res) => {
  if (!/^\d+$/.test(req.query.id)) return res.status(400).json({ error: "Invalid user id" })
  const conn = mysql.createConnection({ host: "db", user: "root", password: "root" })
  const q = "SELECT * FROM users WHERE id = ?"
  conn.query(q, [req.query.id], (err, rows) => res.json(rows))
})

module.exports = app
