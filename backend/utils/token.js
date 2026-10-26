import crypto from "crypto";

// Raw random token generate karo (URL-safe)
export const generateRandomToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Token ka SHA-256 hash (DB mein store karne ke liye)
export const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
