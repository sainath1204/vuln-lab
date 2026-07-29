const fs = require("fs")

function read(req, res) {
  const data = fs.readFileSync("/var/data/" + req.query.path)
  res.send(data)
}

module.exports = read
