import type { Locale } from "./locales.js";

interface UiStrings {
  siteDescription: string;
  skipLink: string;
  languageSwitcher: string;
  navLabel: string;
  themeToggle: string;
  aboutHeading: string;
  experienceHeading: string;
  responsibilitiesHeading: string;
  impactHeading: string;
  projectsHeading: string;
  projectStoryHeading: string;
  projectLanguage: string;
  projectStars: string;
  projectUpdated: string;
  projectRepositoryLink: string;
  projectHomepageLink: string;
  contactHeading: string;
  contactName: string;
  contactEmail: string;
  contactMessage: string;
  contactSubmit: string;
  contactLoading: string;
  contactSuccess: string;
  contactInvalid: string;
  contactSpam: string;
  contactError: string;
  contactPrivacy: string;
}

const es: UiStrings = {
  siteDescription: "Web personal y portfolio de Javier Plaza Sisqués.",
  skipLink: "Saltar al contenido",
  languageSwitcher: "English",
  navLabel: "Principal",
  themeToggle: "Tema oscuro",
  aboutHeading: "Sobre mí",
  experienceHeading: "Experiencia",
  responsibilitiesHeading: "Responsabilidades",
  impactHeading: "Impacto",
  projectsHeading: "Proyectos",
  projectStoryHeading: "Cómo se construyó",
  projectLanguage: "Lenguaje",
  projectStars: "Estrellas",
  projectUpdated: "Última actualización",
  projectRepositoryLink: "Repositorio",
  projectHomepageLink: "Sitio web",
  contactHeading: "Contacto",
  contactName: "Nombre",
  contactEmail: "Correo electrónico",
  contactMessage: "Mensaje",
  contactSubmit: "Enviar mensaje",
  contactLoading: "Enviando tu mensaje…",
  contactSuccess:
    "Tu mensaje se ha enviado. Te responderé a la dirección indicada.",
  contactInvalid: "Revisa los campos marcados.",
  contactSpam: "No se ha podido comprobar que eres humano. Inténtalo de nuevo.",
  contactError: "No se ha podido enviar el mensaje. Inténtalo de nuevo.",
  contactPrivacy:
    "Al enviar este formulario compartes tu nombre, tu correo electrónico y tu mensaje. Solo se usan para responder a tu consulta: se envían por correo y no se almacenan en ningún sitio. Cloudflare Turnstile comprueba que el envío no es spam.",
};

const en: UiStrings = {
  siteDescription: "Personal website and portfolio of Javier Plaza Sisqués.",
  skipLink: "Skip to content",
  languageSwitcher: "Español",
  navLabel: "Main",
  themeToggle: "Dark theme",
  aboutHeading: "About me",
  experienceHeading: "Experience",
  responsibilitiesHeading: "Responsibilities",
  impactHeading: "Impact",
  projectsHeading: "Projects",
  projectStoryHeading: "How it was built",
  projectLanguage: "Language",
  projectStars: "Stars",
  projectUpdated: "Last update",
  projectRepositoryLink: "Repository",
  projectHomepageLink: "Website",
  contactHeading: "Contact",
  contactName: "Name",
  contactEmail: "Email address",
  contactMessage: "Message",
  contactSubmit: "Send message",
  contactLoading: "Sending your message…",
  contactSuccess:
    "Your message has been sent. I will reply to the address provided.",
  contactInvalid: "Please check the highlighted fields.",
  contactSpam: "We could not verify that you are human. Please try again.",
  contactError: "The message could not be sent. Please try again.",
  contactPrivacy:
    "When you submit this form you share your name, your email address and your message. They are only used to reply to your inquiry: they are sent by email and not stored anywhere. Cloudflare Turnstile checks that the submission is not spam.",
};

export const ui: Record<Locale, UiStrings> = { es, en };

export type UiKey = keyof UiStrings;

export function t(locale: Locale, key: UiKey): string {
  return ui[locale][key];
}
