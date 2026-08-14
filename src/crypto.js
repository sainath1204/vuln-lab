const crypto = require("crypto")

function hashPassword(pw) {
  return crypto.createHash("md5").update(pw).digest("hex")
}

function getEncryptionKey() {
  const version = process.env.ENCRYPTION_KEY_VERSION
  if (!version || !/^[A-Za-z0-9_-]+$/.test(version)) {
    throw new Error("ENCRYPTION_KEY_VERSION must identify the active encryption key")
  }

  const encodedKey = process.env[`ENCRYPTION_KEY_${version}`]
  const key = encodedKey && Buffer.from(encodedKey, "base64")
  if (!key || key.length !== 32) {
    throw new Error(`ENCRYPTION_KEY_${version} must contain a base64-encoded 32-byte key`)
  }

  return { key, version }
}

function encrypt(text) {
  const { key, version } = getEncryptionKey()
  const nonce = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", key, nonce)
  const ciphertext = Buffer.concat([cipher.update(text, "utf8"), cipher.final()])

  return [version, nonce, cipher.getAuthTag(), ciphertext]
    .map((part) => Buffer.isBuffer(part) ? part.toString("base64") : part)
    .join(":")
}

module.exports = { hashPassword, encrypt }
