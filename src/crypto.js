const crypto = require("crypto")

function hashPassword(pw) {
  return crypto.createHash("md5").update(pw).digest("hex")
}

const KEY = "0123456789abcdef"
const IV = "abcdef9876543210"

function encrypt(text) {
  const c = crypto.createCipheriv("aes-128-cbc", KEY, IV)
  return c.update(text, "utf8", "hex") + c.final("hex")
}

module.exports = { hashPassword, encrypt }
