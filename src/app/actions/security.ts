// app/actions/security.ts
'use server';

import AES from 'crypto-js/aes';

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