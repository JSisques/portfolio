import type { ContactMessage, MailPort } from "../port.js";

// Structural shape of the Cloudflare `send_email` binding's structured
// send() (Email Service Workers API), so tests inject a fake binding
// without a cloudflare:* import.
export interface SendEmailBinding {
  send(message: {
    to: string;
    from: string;
    subject: string;
    text: string;
    replyTo: string;
  }): Promise<unknown>;
}

export interface CloudflareMailConfig {
  recipient: string;
  sender: string;
}

export function createCloudflareMailPort(
  binding: SendEmailBinding,
  config: CloudflareMailConfig,
): MailPort {
  return {
    async send(message: ContactMessage) {
      await binding.send({
        to: config.recipient,
        from: config.sender,
        subject: `Contact form: ${message.name}`,
        text: `Name: ${message.name}\nEmail: ${message.email}\n\n${message.message}`,
        replyTo: message.email,
      });
    },
  };
}
