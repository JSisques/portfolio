import type { ContactMessage } from "./port.js";

export type ContactField = "name" | "email" | "message";

export type ValidationResult =
  { ok: true; value: ContactMessage } | { ok: false; fields: ContactField[] };

// A single address that can receive a reply: exactly one "@", no spaces or
// commas, and a domain with at least one dot.
const EMAIL_PATTERN = /^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/;

function stringValue(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

export function validateSubmission(form: FormData): ValidationResult {
  const name = stringValue(form.get("name"));
  const email = stringValue(form.get("email"));
  const message = stringValue(form.get("message"));

  const fields: ContactField[] = [];
  // The name becomes the mail subject, so control characters (line breaks
  // included) and Unicode line separators are rejected.
  if (
    name.length < 1 ||
    name.length > 100 ||
    /[\p{Cc}\u2028\u2029]/u.test(name)
  ) {
    fields.push("name");
  }
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    fields.push("email");
  }
  if (message.length < 1 || message.length > 5000) {
    fields.push("message");
  }

  if (fields.length > 0) {
    return { ok: false, fields };
  }
  return { ok: true, value: { name, email, message } };
}
