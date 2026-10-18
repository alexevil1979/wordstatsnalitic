import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

function getKey(): Buffer {
  const raw = process.env.CREDENTIALS_ENCRYPTION_KEY || process.env.AUTH_SECRET || "dev-only-wordstat-key";
  return createHash("sha256").update(raw).digest();
}

export function encryptSecret(plain: string): { ciphertext: string; iv: string; hint: string } {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const payload = Buffer.concat([enc, tag]).toString("base64");
  const hint = plain.length <= 4 ? "****" : `${"*".repeat(Math.min(8, plain.length - 4))}${plain.slice(-4)}`;
  return { ciphertext: payload, iv: iv.toString("base64"), hint };
}

export function decryptSecret(ciphertext: string, ivB64: string): string {
  const buf = Buffer.from(ciphertext, "base64");
  const iv = Buffer.from(ivB64, "base64");
  const tag = buf.subarray(buf.length - 16);
  const data = buf.subarray(0, buf.length - 16);
  const decipher = createDecipheriv("aes-256-gcm", getKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}
