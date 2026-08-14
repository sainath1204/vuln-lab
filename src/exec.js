const { execFile } = require("child_process")
const { isIP } = require("net")

function ping(req, res) {
  const host = req.query.host
  if (typeof host !== "string" || !isIP(host)) return res.status(400).send("Invalid host")

  execFile("ping", ["-c", "1", host], (err, stdout) => res.send(stdout))
}

module.exports = ping
