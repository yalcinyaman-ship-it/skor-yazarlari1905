import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const DB_ID = "ai-studio-8a4c5510-1582-40d4-be8a-e881af6c5929";

export function adminDb() {
  if (!getApps().length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT ortam değişkeni Vercel'de tanımlı değil.");
    initializeApp({ credential: cert(JSON.parse(raw)) });
  }
  return getFirestore(getApps()[0], DB_ID);
}
