import type { ContactMessage, MailPort } from "../port.js";

// ADR-0021: previews run the full submission flow without sending mail; the
// log line records lengths only, never the submission contents.
export function createLogMailPort(): MailPort {
  return {
    async send(message: ContactMessage) {
      const replyToDomain = message.email.split("@").pop() ?? "";
      console.log(
        `contact form submission: name=${message.name.length}ch message=${message.message.length}ch reply-to-domain=${replyToDomain} (not sent)`,
      );
    },
  };
}
