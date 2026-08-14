const crypto = require("crypto")

function hashPassword(pw) {
  const salt = crypto.randomBytes(16)
  const hash = crypto.scryptSync(pw, salt, 64, {
    N: 131072,
    r: 8,
    p: 1,
    maxmem: 256 * 1024 * 1024,
  })
  return `scrypt$131072$8$1$${salt.toString("hex")}$${hash.toString("hex")}`
}

const KEY = "0123456789abcdef"
const IV = "abcdef9876543210"

function encrypt(text) {
  const c = crypto.createCipheriv("aes-128-cbc", KEY, IV)
  return c.update(text, "utf8", "hex") + c.final("hex")
}

module.exports = { hashPassword, encrypt }
