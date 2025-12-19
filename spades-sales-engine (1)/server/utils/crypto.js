
const crypto = require('crypto');

// Prevents server crash if ENCRYPTION_SECRET is missing from .env
const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET || 'spades_recovery_fallback_secret_2024_01_01';

const ALGO = "aes-256-gcm";
const KEY = crypto.scryptSync(
  ENCRYPTION_SECRET,
  "integration_salt",
  32
);

function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final()
  ]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

function decrypt(payload) {
  const [ivHex, tagHex, dataHex] = payload.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const tag = Buffer.from(tagHex, "hex");
  const data = Buffer.from(dataHex, "hex");
  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(tag);
  return decipher.update(data, null, "utf8") + decipher.final("utf8");
}

module.exports = { encrypt, decrypt };
