"use client";

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

/**
 * Firebase config is read from NEXT_PUBLIC_FIREBASE_* (baked at build time).
 * Until those are set, `firebaseReady()` is false and the UI falls back to
 * email login — nothing breaks.
 */
const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function firebaseReady(): boolean {
  return Boolean(cfg.apiKey && cfg.authDomain && cfg.projectId && cfg.appId);
}

let cachedAuth: Auth | null = null;

export function getFirebaseAuth(): Auth | null {
  if (!firebaseReady() || typeof window === "undefined") return null;
  const app: FirebaseApp = getApps().length ? getApp() : initializeApp(cfg as Record<string, string>);
  if (!cachedAuth) {
    cachedAuth = getAuth(app);
    cachedAuth.useDeviceLanguage();
  }
  return cachedAuth;
}
