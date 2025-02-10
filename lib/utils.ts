import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STORAGE_KEY = "reportapp_user";

/**
 * Truncates a string to a specified maximum length and adds an ellipsis if necessary.
 * @param str - The input string to truncate.
 * @param maxLength - The maximum length of the truncated string (including the ellipsis).
 * @returns The truncated string.
 */
export const subStr = (str: string, maxLength: number): string => {
  if (str.length <= maxLength) {
    return str; // Return the original string if it's already within the limit
  }

  // Truncate the string and add an ellipsis
  return str.slice(0, maxLength - 3) + "...";
};

export function getFirebaseAuthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    // Common errors
    case "auth/invalid-credential":
      return "Invalid email or password. Please check your credentials and try again.";
    case "auth/invalid-email":
      return "The email address is not valid. Please check and try again.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support for assistance.";
    case "auth/user-not-found":
      return "No account found with this email address. Please sign up.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again or reset your password.";
    case "auth/email-already-in-use":
      return "This email address is already in use. Please use another email.";
    case "auth/operation-not-allowed":
      return "This operation is not allowed. Please contact support.";
    case "auth/weak-password":
      return "The password is too weak. Please choose a stronger password.";
    case "auth/too-many-requests":
      return "Too many requests. Please try again later.";
    case "auth/network-request-failed":
      return "A network error occurred. Please check your internet connection.";

    // Email/link-related errors
    case "auth/invalid-action-code":
      return "The action code is invalid or has expired. Please request a new link.";
    case "auth/expired-action-code":
      return "The action code has expired. Please request a new link.";
    case "auth/invalid-verification-code":
      return "The verification code is invalid. Please check and try again.";
    case "auth/invalid-verification-id":
      return "The verification ID is invalid. Please request a new link.";

    // Phone authentication errors
    case "auth/invalid-phone-number":
      return "The phone number is not valid. Please check and try again.";
    case "auth/missing-phone-number":
      return "Please provide a phone number.";
    case "auth/quota-exceeded":
      return "The SMS quota for this project has been exceeded. Please try again later.";
    case "auth/captcha-check-failed":
      return "The reCAPTCHA verification failed. Please try again.";

    // Other errors
    case "auth/requires-recent-login":
      return "This operation requires a recent login. Please log in again.";
    case "auth/provider-already-linked":
      return "This provider is already linked to your account.";
    case "auth/credential-already-in-use":
      return "This credential is already associated with another account.";
    case "auth/popup-blocked":
      return "The popup was blocked by your browser. Please allow popups and try again.";
    case "auth/popup-closed-by-user":
      return "The popup was closed before completing the operation. Please try again.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for Firebase Authentication. Please contact support.";
    case "auth/invalid-user-token":
    case "auth/user-token-expired":
      return "Your session has expired. Please log in again.";

    // Default error message
    default:
      return "An unexpected error occurred. Please try again or contact support.";
  }
}

/**
 * Checks if a user has admin role by checking localStorage
 * @returns boolean indicating if the user is an admin
 */
export const isAdminUser = (): boolean => {
  const userStr = localStorage.getItem(STORAGE_KEY);
  if (!userStr) return false;

  try {
    const user = JSON.parse(userStr);
    return user.role === 'admin';
  } catch (error) {
    console.error('Error parsing user data:', error);
    return false;
  }
};

/**
 * Formats a number with thousand separators.
 * @param num - The number to format.
 * @param locale - The locale to use for formatting (default is 'en-US').
 * @returns The formatted number as a string.
 */
export const formatNumber = (num: number, locale: string = "en-US"): string => {
  return num.toLocaleString(locale);
};
