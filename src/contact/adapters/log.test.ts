import { describe, expect, it, vi } from "vitest";
import { createLogMailPort } from "./log.js";
import type { ContactMessage } from "../port.js";

const submission: ContactMessage = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Hello, this is my message.",
};

describe("createLogMailPort", () => {
  it("logs one line with the field lengths and reply-to domain, never the contents", async () => {
    const log = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      await createLogMailPort().send(submission);
      expect(log).toHaveBeenCalledTimes(1);
      const line = log.mock.calls[0]?.join(" ") ?? "";
      expect(line).toBe(
        "contact form submission: name=12ch message=26ch reply-to-domain=example.com (not sent)",
      );
      expect(line).not.toContain("Ada Lovelace");
      expect(line).not.toContain("Hello, this is my message.");
      expect(line).not.toContain("ada@example.com");
    } finally {
      log.mockRestore();
    }
  });
});
