export type CookieConsentChoice = "accepted" | "rejected";

export const COOKIE_CONSENT_KEY = "zentt_cookie_consent";
export const COOKIE_CONSENT_EVENT = "zentt-cookie-consent";

export function getCookieConsent(): CookieConsentChoice | null {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(COOKIE_CONSENT_KEY);
    return value === "accepted" || value === "rejected" ? value : null;
  } catch {
    return null;
  }
}

export function setCookieConsent(choice: CookieConsentChoice) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, choice);
  } catch {
    // localStorage can be unavailable in private browsing.
  }

  window.dispatchEvent(
    new CustomEvent<CookieConsentChoice>(COOKIE_CONSENT_EVENT, {
      detail: choice,
    })
  );
}
