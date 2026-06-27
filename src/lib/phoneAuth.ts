"use client";

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";

let verifier: RecaptchaVerifier | null = null;

/** Send an SMS OTP to an E.164 phone (e.g. +9779800000000). Returns a confirmation handle. */
export async function sendPhoneOtp(phoneE164: string, recaptchaContainerId: string): Promise<ConfirmationResult> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Phone login isn't available right now.");

  // Fresh invisible reCAPTCHA each send (avoids stale-widget errors on retry).
  if (verifier) {
    try {
      verifier.clear();
    } catch {
      /* ignore */
    }
    verifier = null;
  }
  verifier = new RecaptchaVerifier(auth, recaptchaContainerId, { size: "invisible" });
  return signInWithPhoneNumber(auth, phoneE164, verifier);
}

/** Confirm the OTP the user typed; returns the Firebase ID token to hand to our backend. */
export async function confirmPhoneOtp(confirmation: ConfirmationResult, code: string): Promise<string> {
  const cred = await confirmation.confirm(code);
  return cred.user.getIdToken();
}
