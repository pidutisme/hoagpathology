
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getFirebaseApp() {
  const existing = getApps().find(
    (app) => app.name === "hoagpathology"
  );

  if (existing) return existing;

  const clientEmail = requiredEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = requiredEnv("FIREBASE_PRIVATE_KEY")
    .replace(/\\n/g, "\n");
  const databaseURL = (
    process.env.FIREBASE_DATABASE_URL ||
    process.env.FIREBASE_DB_URL ||
    ""
  ).replace(/\/+$/, "");

  if (!databaseURL) {
    throw new Error("Missing FIREBASE_DATABASE_URL");
  }

  return initializeApp(
    {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail,
        privateKey
      }),
      databaseURL
    },
    "hoagpathology"
  );
}

export function firebaseDb() {
  return getDatabase(getFirebaseApp());
}
