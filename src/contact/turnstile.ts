const SITE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export type TurnstileVerifier = (
  token: string,
  remoteIp?: string,
) => Promise<boolean>;

// ADR-0013: siteverify is a plain HTTP API, so the container target verifies
// outside Cloudflare with the same code path as the Worker.
export function createTurnstileVerifier(
  secret: string,
  fetchFn: typeof fetch = fetch,
): TurnstileVerifier {
  return async (token: string, remoteIp?: string) => {
    const body = new URLSearchParams({ secret, response: token });
    if (remoteIp !== undefined) {
      body.set("remoteip", remoteIp);
    }
    let response: Response;
    try {
      response = await fetchFn(SITE_VERIFY_URL, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
    } catch {
      return false;
    }
    if (!response.ok) {
      return false;
    }
    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      return false;
    }
    return (
      typeof payload === "object" &&
      payload !== null &&
      (payload as { success?: unknown }).success === true
    );
  };
}
