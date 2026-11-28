// S6: the contact form is submitted with fetch (Turnstile needs JavaScript
// anyway), and the loading/success/invalid/spam/error states are announced
// in the aria-live region.
// Behavior is covered by tests/e2e/contact.spec.ts.
const form = document.querySelector<HTMLFormElement>("#contact-form");
const submit = document.querySelector<HTMLButtonElement>("#contact-submit");
const statusRegion =
  document.querySelector<HTMLParagraphElement>("#contact-status");

if (form && submit && statusRegion) {
  const messages = {
    loading: form.dataset.loading ?? "",
    success: form.dataset.success ?? "",
    invalid: form.dataset.invalid ?? "",
    spam: form.dataset.spam ?? "",
    error: form.dataset.error ?? "",
  };

  const announce = (message: string) => {
    statusRegion.textContent = message;
  };

  const clearInvalidFields = () => {
    for (const element of form.elements) {
      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement
      ) {
        element.removeAttribute("aria-invalid");
      }
    }
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submit.disabled = true;
    form.setAttribute("aria-busy", "true");
    announce(messages.loading);
    fetch(form.action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    })
      .then(async (response) => {
        const payload = (await response.json().catch(() => null)) as {
          status?: string;
          fields?: string[];
        } | null;
        clearInvalidFields();
        const invalid =
          payload?.status === "invalid" && Array.isArray(payload.fields);
        // Turnstile tokens verify once. Every answer except "invalid"
        // (rejected before verification) consumed the token, so the widget
        // is reset before the visitor retries.
        if (!invalid) {
          (window as { turnstile?: { reset(): void } }).turnstile?.reset();
        }
        if (payload?.status === "sent") {
          announce(messages.success);
          form.reset();
        } else if (invalid && payload?.fields) {
          let firstInvalid: HTMLElement | null = null;
          for (const name of payload.fields) {
            const field = form.elements.namedItem(name);
            if (field instanceof HTMLElement) {
              field.setAttribute("aria-invalid", "true");
              firstInvalid ??= field;
            }
          }
          firstInvalid?.focus();
          announce(messages.invalid);
        } else if (payload?.status === "spam") {
          announce(messages.spam);
        } else {
          announce(messages.error);
        }
      })
      .catch(() => {
        announce(messages.error);
      })
      .finally(() => {
        submit.disabled = false;
        form.removeAttribute("aria-busy");
      });
  });
}
