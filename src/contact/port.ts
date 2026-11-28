export interface ContactMessage {
  name: string;
  email: string;
  message: string;
}

export interface MailPort {
  send(message: ContactMessage): Promise<void>;
}
