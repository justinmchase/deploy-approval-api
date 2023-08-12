import { ApplicationError, oak } from "grove";

export class AuthenticationError extends ApplicationError {
  constructor(reason?: string) {
    super(
      oak.Status.Unauthorized,
      "E_AUTHENTICATION",
      oak.STATUS_TEXT[oak.Status.Unauthorized],
      reason,
    );
  }
}
