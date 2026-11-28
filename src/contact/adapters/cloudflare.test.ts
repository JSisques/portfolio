import { describe, expect, it } from "vitest";
import {
  createCloudflareMailPort,
  type SendEmailBinding,
} from "./cloudflare.js";

type SentMessage = {
  to: string;
  from: string;
  subject: string;
  text: string;
  replyTo: string;
};

function fakeBinding(error?: unknown) {
  const sent: SentMessage[] = [];
  const binding: SendEmailBinding = {
    send: async (message) => {
      sent.push(message);
      if (error !== undefined) {
        throw error;
      }
    },
  };
  return { sent, binding };
}

const config = {
  recipient: "owner@example.com",
  sender: "noreply@example.com",
};

describe("createCloudflareMailPort", () => {
  it("sends to the configured recipient with the visitor address as reply-to", async () => {
    const { sent, binding } = fakeBinding();
    const port = createCloudflareMailPort(binding, config);
    await port.send({
      name: "Ada Lovelace",
      email: "ada@example.com",
      message: "Hello there",
    });
    expect(sent).toHaveLength(1);
    const [message] = sent;
    expect(message?.to).toBe("owner@example.com");
    expect(message?.from).toBe("noreply@example.com");
    expect(message?.subject).toBe("Contact form: Ada Lovelace");
    expect(message?.replyTo).toBe("ada@example.com");
    expect(message?.text).toContain("Ada Lovelace");
    expect(message?.text).toContain("ada@example.com");
    expect(message?.text).toContain("Hello there");
  });

  it("propagates a binding failure so the handler can report 502", async () => {
    const { binding } = fakeBinding(new Error("E_DELIVERY_FAILED"));
    const port = createCloudflareMailPort(binding, config);
    await expect(
      port.send({
        name: "Ada Lovelace",
        email: "ada@example.com",
        message: "Hi",
      }),
    ).rejects.toThrow("E_DELIVERY_FAILED");
  });
});
