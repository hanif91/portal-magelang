'use server';

import AES from 'crypto-js/aes';
import Utf8 from 'crypto-js/enc-utf8';

export async function encryptToken(token: string) {
  const secretKey = process.env.SSO_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Konfigurasi Server Error: Secret Key belum diset.");
  }

  // Proses Enkripsi
  // Hasilnya adalah string acak seperti: U2FsdGVkX1+...
  const encrypted = AES.encrypt(token, secretKey).toString();

  return encrypted;
}

export async function decryptToken(encryptedToken: string) {
  const secretKey = process.env.SSO_SECRET_KEY;

  if (!secretKey) {
    throw new Error("Konfigurasi Server Error: Secret Key belum diset.");
  }

  try {
    const bytes = AES.decrypt(encryptedToken, secretKey);
    const originalToken = bytes.toString(Utf8);

    if (!originalToken) {
      throw new Error("Gagal mendekripsi token");
    }

    return originalToken;
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Token tidak valid atau gagal didekripsi");
  }
}