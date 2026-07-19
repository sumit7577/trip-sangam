"use client";

import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebase";

let verifier: RecaptchaVerifier | null = null;

/**
 * Drop any live reCAPTCHA verifier. Call this whenever the container element
 * it was bound to goes away (e.g. the sign-in modal closes) — otherwise
 * grecaptcha's own widget registry still thinks a widget lives at that
 * container id, and the next `new RecaptchaVerifier(...)` on a fresh element
 * with the same id throws "reCAPTCHA has already been rendered in this
 * element" even though our JS-level reference was reset.
 */
export function resetPhoneAuth() {
  if (verifier) {
    try {
      verifier.clear();
    } catch {
      /* ignore */
    }
    verifier = null;
  }
}

/** Send an SMS OTP to an E.164 phone (e.g. +9779800000000). Returns a confirmation handle. */
export async function sendPhoneOtp(phoneE164: string, recaptchaContainerId: string): Promise<ConfirmationResult> {
  const auth = getFirebaseAuth();
  if (!auth) throw new Error("Phone login isn't available right now.");

  // Fresh invisible reCAPTCHA each send (avoids stale-widget errors on retry).
  resetPhoneAuth();
  // Belt-and-suspenders: also wipe the container's DOM directly. grecaptcha's
  // internal registry can outlive both our JS reference AND verifier.clear()
  // across a full unmount/remount of the container (e.g. modal close/reopen).
  const container = document.getElementById(recaptchaContainerId);
  if (container) container.replaceChildren();
  verifier = new RecaptchaVerifier(auth, recaptchaContainerId, { size: "invisible" });
  return signInWithPhoneNumber(auth, phoneE164, verifier);
}

/** Confirm the OTP the user typed; returns the Firebase ID token to hand to our backend. */
export async function confirmPhoneOtp(confirmation: ConfirmationResult, code: string): Promise<string> {
  const cred = await confirmation.confirm(code);
  return cred.user.getIdToken();
}
