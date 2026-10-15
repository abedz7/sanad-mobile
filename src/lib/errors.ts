import { ApiRequestError } from '../api/client';

/**
 * Maps a failed request to a message safe to show the user. Auth failures are
 * deliberately generic — never hint whether the email exists or is locked.
 */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiRequestError) {
    switch (error.code) {
      case 'AUTH_INVALID_CREDENTIALS':
        return 'Email or password is incorrect.';
      case 'RATE_LIMITED':
        return 'Too many attempts. Please wait a few minutes and try again.';
      case 'VALIDATION_FAILED':
        return error.details?.[0]?.message ?? error.message;
      case 'CONFLICT':
        return 'An account with this email already exists.';
      default:
        return error.message;
    }
  }
  return 'Something went wrong. Please try again.';
}
