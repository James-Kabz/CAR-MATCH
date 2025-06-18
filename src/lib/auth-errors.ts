export const AuthErrorCodes = {
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  RESEND_FAILED: "RESEND_FAILED",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type AuthErrorCode = typeof AuthErrorCodes[keyof typeof AuthErrorCodes];

export const AuthErrorMessages: Record<AuthErrorCode, string> = {
  [AuthErrorCodes.EMAIL_NOT_VERIFIED]: "Please verify your email before signing in",
  [AuthErrorCodes.INVALID_CREDENTIALS]: "Invalid email or password",
  [AuthErrorCodes.RESEND_FAILED]: "Failed to send verification email",
  [AuthErrorCodes.UNKNOWN_ERROR]: "An unknown error occurred",
};

export function getAuthErrorMessage(code: string): string {
  return AuthErrorMessages[code as AuthErrorCode] || AuthErrorMessages.UNKNOWN_ERROR;
}