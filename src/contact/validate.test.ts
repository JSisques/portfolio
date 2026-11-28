import { describe, expect, it } from "vitest";
import { validateSubmission } from "./validate.js";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    data.append(key, value);
  }
  return data;
}

const validFields = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Hello there",
};

describe("validateSubmission", () => {
  it("returns the trimmed ContactMessage for a valid submission", () => {
    expect(
      validateSubmission(
        form({
          name: "  Ada Lovelace ",
          email: " ada@example.com ",
          message: "  Hello there  ",
        }),
      ),
    ).toEqual({ ok: true, value: validFields });
  });

  it("accepts the boundary lengths: 100-char name, 254-char email, 5000-char message", () => {
    const email = `${"a".repeat(242)}@example.com`;
    expect(email).toHaveLength(254);
    expect(
      validateSubmission(
        form({
          name: "n".repeat(100),
          email,
          message: "m".repeat(5000),
        }),
      ),
    ).toEqual({
      ok: true,
      value: { name: "n".repeat(100), email, message: "m".repeat(5000) },
    });
  });

  it("rejects an empty name", () => {
    expect(validateSubmission(form({ ...validFields, name: "" }))).toEqual({
      ok: false,
      fields: ["name"],
    });
  });

  it("rejects a name with a line break, because it becomes the mail subject", () => {
    for (const name of ["Ada\r\nBcc: x@example.com", "Ada\nLovelace"]) {
      expect(validateSubmission(form({ ...validFields, name }))).toEqual({
        ok: false,
        fields: ["name"],
      });
    }
  });

  it("rejects a name with any control or line-separator character", () => {
    for (const char of ["\t", "\u0000", "\u0085", "\u2028", "\u2029"]) {
      const name = `Ada${char}Lovelace`;
      expect(validateSubmission(form({ ...validFields, name }))).toEqual({
        ok: false,
        fields: ["name"],
      });
    }
  });

  it("rejects a name longer than 100 characters", () => {
    expect(
      validateSubmission(form({ ...validFields, name: "n".repeat(101) })),
    ).toEqual({ ok: false, fields: ["name"] });
  });

  it("rejects an email that is not a single address", () => {
    expect(
      validateSubmission(
        form({ ...validFields, email: "ada@example.com, eve@example.com" }),
      ),
    ).toEqual({ ok: false, fields: ["email"] });
    expect(
      validateSubmission(form({ ...validFields, email: "ada example.com" })),
    ).toEqual({ ok: false, fields: ["email"] });
    expect(
      validateSubmission(form({ ...validFields, email: "ada.example.com" })),
    ).toEqual({ ok: false, fields: ["email"] });
  });

  it("rejects an email longer than 254 characters", () => {
    expect(
      validateSubmission(
        form({ ...validFields, email: `${"a".repeat(243)}@example.com` }),
      ),
    ).toEqual({ ok: false, fields: ["email"] });
  });

  it("rejects an empty message", () => {
    expect(validateSubmission(form({ ...validFields, message: "" }))).toEqual({
      ok: false,
      fields: ["message"],
    });
  });

  it("rejects a message longer than 5000 characters", () => {
    expect(
      validateSubmission(form({ ...validFields, message: "m".repeat(5001) })),
    ).toEqual({ ok: false, fields: ["message"] });
  });

  it("names every invalid field, in form order", () => {
    expect(
      validateSubmission(
        form({ name: "", email: "nope", message: "m".repeat(5001) }),
      ),
    ).toEqual({ ok: false, fields: ["name", "email", "message"] });
  });
});
