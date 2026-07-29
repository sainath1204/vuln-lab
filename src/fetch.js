const axios = require("axios")

async function proxy(req, res) {
  const r = await axios.get(req.query.url)
  res.send(r.data)
}

module.exports = proxy
