import crypto from "crypto";

const ITERATIONS = 100000;
const DIGEST = "sha256";
const SALT_LENGTH = 32;

export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
    crypto.pbkdf2(password, salt, ITERATIONS, 64, DIGEST, (err, hash) => {
      if (err) reject(err);
      resolve(`${salt}:${hash.toString("hex")}`);
    });
  });
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, hashHex] = hash.split(":");
    crypto.pbkdf2(password, salt, ITERATIONS, 64, DIGEST, (err, hash) => {
      if (err) reject(err);
      resolve(hash.toString("hex") === hashHex);
    });
  });
}
