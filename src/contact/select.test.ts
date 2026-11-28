import { describe, expect, it, vi } from "vitest";
import { selectMailAdapter } from "./select.js";
import type { SendEmailBinding } from "./adapters/cloudflare.js";
import type { ContactMessage } from "./port.js";

const submission: ContactMessage = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  message: "Hello there",
};

function spyBinding() {
  const sent: {
    to: string;
    from: string;
    subject: string;
    text: string;
    replyTo: string;
  }[] = [];
  const binding: SendEmailBinding = {
    send: async (message) => {
      sent.push(message);
    },
  };
  return { sent, binding };
}

function captureError(fn: () => void): unknown {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error("expected the function to throw");
}

describe("selectMailAdapter", () => {
  it.each(["log", undefined, "carrier-pigeon"])(
    "selects the log-only adapter and never calls the binding when MAIL_ADAPTER is %s",
    async (adapter) => {
      const log = vi.spyOn(console, "log").mockImplementation(() => {});
      try {
        const { sent, binding } = spyBinding();
        const port = selectMailAdapter({
          ...(adapter === undefined ? {} : { MAIL_ADAPTER: adapter }),
          SEND_EMAIL: binding,
        });
        await port.send(submission);
        expect(sent).toHaveLength(0);
        expect(log).toHaveBeenCalledTimes(1);
      } finally {
        log.mockRestore();
      }
    },
  );

  it("selects the Cloudflare adapter with the configured recipient and sender", async () => {
    const { sent, binding } = spyBinding();
    const port = selectMailAdapter({
      MAIL_ADAPTER: "cloudflare",
      SEND_EMAIL: binding,
      CONTACT_RECIPIENT: "owner@example.com",
      MAIL_FROM: "noreply@example.com",
    });
    await port.send(submission);
    expect(sent).toHaveLength(1);
    expect(sent[0]?.to).toBe("owner@example.com");
    expect(sent[0]?.from).toBe("noreply@example.com");
    expect(sent[0]?.replyTo).toBe("ada@example.com");
  });

  it("throws naming the missing SEND_EMAIL binding", () => {
    const error = captureError(() =>
      selectMailAdapter({
        MAIL_ADAPTER: "cloudflare",
        CONTACT_RECIPIENT: "owner@example.com",
        MAIL_FROM: "noreply@example.com",
      }),
    );
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain("SEND_EMAIL");
  });

  it("throws naming the missing CONTACT_RECIPIENT", () => {
    const { binding } = spyBinding();
    const error = captureError(() =>
      selectMailAdapter({
        MAIL_ADAPTER: "cloudflare",
        SEND_EMAIL: binding,
        MAIL_FROM: "noreply@example.com",
      }),
    );
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain("CONTACT_RECIPIENT");
  });

  it("throws naming the missing MAIL_FROM", () => {
    const { binding } = spyBinding();
    const error = captureError(() =>
      selectMailAdapter({
        MAIL_ADAPTER: "cloudflare",
        SEND_EMAIL: binding,
        CONTACT_RECIPIENT: "owner@example.com",
      }),
    );
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain("MAIL_FROM");
  });

  it("reserves the smtp slot for #13", () => {
    const error = captureError(() =>
      selectMailAdapter({ MAIL_ADAPTER: "smtp" }),
    );
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toBe(
      "SMTP adapter not available until #13",
    );
  });
});
