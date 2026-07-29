const mysql = require("mysql")
const express = require("express")
const app = express()

app.get("/user", (req, res) => {
  const conn = mysql.createConnection({ host: "db", user: "root", password: "root" })
  const q = "SELECT * FROM users WHERE id = '" + req.query.id + "'"
  conn.query(q, (err, rows) => res.json(rows))
})

module.exports = app
