import crypto from "crypto";
import dotenv from "dotenv";

// https://github.com/bcgit/pc-dart/blob/master/tutorials/aes-cbc.md
// https://www.javainuse.com/aesgenerator

// Load environment variables from .env file
dotenv.config();

// Access key and IV from environment variables
const myKEY = Buffer.from(process.env.AES_KEY as string, "utf8"); // AES Key from .env
const myIV = Buffer.from(process.env.AES_IV as string, "utf8"); // AES IV from .env

// AES CBC encryption
function aesCbcEncrypt(key: Buffer, iv: Buffer, plaintext: Buffer): Buffer {
  if (![16, 24, 32].includes(key.length)) {
    throw new Error("Key must be 128, 192, or 256 bits.");
  }
  if (iv.length !== 16) {
    throw new Error("IV must be 128 bits.");
  }

  // Create cipher
  const cipher = crypto.createCipheriv("aes-128-cbc", key, iv);

  // Encrypt
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);

  return encrypted;
}

// AES CBC decryption
function aesCbcDecrypt(key: Buffer, iv: Buffer, ciphertext: Buffer): Buffer {
  if (![16, 24, 32].includes(key.length)) {
    throw new Error("Key must be 128, 192, or 256 bits.");
  }
  if (iv.length !== 16) {
    throw new Error("IV must be 128 bits.");
  }

  // Create decipher
  const decipher = crypto.createDecipheriv("aes-128-cbc", key, iv);

  // Decrypt
  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return decrypted;
}

// Example Usage

// Define your own 128-bit (16 bytes) key and IV
const key = myKEY; // 16-byte key
const iv = myIV; // 16-byte IV

// // Example plaintext (must be padded or divisible by 16 bytes)
// const plaintext = Buffer.from("This is a test message.", "utf8");

// // Encrypt
// const encrypted = aesCbcEncrypt(key, iv, plaintext);
// console.log("Encrypted (hex):", encrypted.toString("hex"));

// // Decrypt
// const decrypted = aesCbcDecrypt(key, iv, encrypted);
// console.log("Decrypted (utf8):", decrypted.toString("utf8"));

// Convert Base64 string to Buffer
const ciphertext = Buffer.from(
  "7Z/M+55eLnKez76slRIlC3SZQRfrM8wTEe6qzl72BFg=",
  "base64"
);

// Decrypt
const decrypted = aesCbcDecrypt(key, iv, ciphertext);
console.log("Decrypted (utf8):", decrypted.toString("utf8"));
