# vuln-lab

Test service (intentionally insecure) for security scanning: vulnerable dependencies, code vulnerabilities, and hardcoded secrets.

`src/crypto.js` reads its active AES-256 key from `ENCRYPTION_KEY_VERSION` and the matching
`ENCRYPTION_KEY_<version>` environment variable. The key must be a base64-encoded 32-byte secret;
rotate keys by provisioning a new versioned secret and changing `ENCRYPTION_KEY_VERSION`.
