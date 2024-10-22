// import crypto from "crypto";
import * as crypto from "crypto";
// import dotenv from "dotenv";
import * as dotenv from "dotenv";

import * as readline from "readline";

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

// Example plaintext (must be padded or divisible by 16 bytes)
const plaintext = Buffer.from("plug example hello current", "utf8"); // not real phrase

// // Encrypt
// const encrypted = aesCbcEncrypt(key, iv, plaintext);
// console.log("Encrypted :", encrypted);
// const encryptedBase64 = encrypted.toString("base64"); // this is the one i am stoing in cloud
// console.log("encryptedBase64 :", encryptedBase64);

// console.log("Encrypted (hex):", encrypted.toString("hex"));

// Encrypt from real encrypted key example

function decryptFromEncryptedKey(encrypted1: string) {
  // let encrypted1 = "gPinvU4XdB/S0Yv8AMWk4P7C3KaSQ5aIdgUNTY6FfSQ=";
  // Convert Base64 string to Buffer
  const encryptedBuffer1 = Buffer.from(encrypted1, "base64");

  // Decrypt
  // const decrypted = aesCbcDecrypt(key, iv, encrypted);
  const decrypted = aesCbcDecrypt(key, iv, encryptedBuffer1);
  console.log("Decrypted (utf8):", decrypted.toString("utf8"));
}

// Function to encrypt a plaintext string
function encryptToBase64(plaintext: string) {
  const plaintextBuffer = Buffer.from(plaintext, "utf8");
  const encryptedBuffer = aesCbcEncrypt(myKEY, myIV, plaintextBuffer);
  const encryptedBase64 = encryptedBuffer.toString("base64");
  console.log("Encrypted (Base64):", encryptedBase64);
}

// // Convert Base64 string to Buffer
// const ciphertext = Buffer.from(
//   "7Z/M+55eLnKez76slRIlC3SZQRfrM8wTEe6qzl72BFg=",
//   "base64"
// );

// // Decrypt
// const decrypted = aesCbcDecrypt(key, iv, ciphertext);
// console.log("Decrypted (utf8):", decrypted.toString("utf8"));

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Show menu and prompt for input
function showMenu() {
  console.log("Choose an option:");
  console.log("1. Decrypt an encrypted Base64 string");
  console.log('   Example: "gPinvU4XdB/S0Yv8AMWk4P7C3KaSQ5aIdgUNTY6FfSQ="');
  console.log("2. Encrypt a plaintext string to Base64");
  console.log('   Example: "plug example hello current"');

  rl.question("Enter 1 or 2: ", (option) => {
    if (option === "1") {
      rl.question(
        "Enter the Base64 encrypted string to decrypt: ",
        (encryptedInput) => {
          decryptFromEncryptedKey(encryptedInput);
          rl.close();
        }
      );
    } else if (option === "2") {
      rl.question(
        "Enter the plaintext string to encrypt: ",
        (plaintextInput) => {
          encryptToBase64(plaintextInput);
          rl.close();
        }
      );
    } else {
      console.log("Invalid option. Please choose 1 or 2.");
      rl.close();
    }
  });
}

// Start the menu
showMenu();
