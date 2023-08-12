import { ApplicationError, oak } from "grove";

export class SignatureError extends ApplicationError {
  constructor(details?: string) {
    super(
      oak.Status.Unauthorized,
      "E_SIGNATURE",
      "invalid signature",
      details,
    );
  }
}
