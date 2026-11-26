# Design direction

Visual direction for jsisques.net. Defined by the site owner through a Socratic process. Every decision has a written reason. UI work reads this file first and then applies the anti-ai-slop filter during the work (not as an after-the-fact audit).

## Design read

> A professional showcase portfolio for recruiters and technical profiles, in a restrained and warm visual language.
>
> Dial: ENERGY 2 / RHYTHM 2 / MOTION 1

| Dial   | Value                     | Reason                                                                                                                                                        |
| ------ | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ENERGY | 2, balanced               | Calm alone falls into a sterile default and loses the "approachable" trait. Balanced adds one accent and one identity motif on a restrained base.             |
| RHYTHM | 2, consistent with breaks | Sections have different shapes (a timeline, comparable projects, a personal text, an action). A shared structure, broken where the content requires it.       |
| MOTION | 1, minimal                | Hover and focus states, plus brief purposeful transitions (for example, theme change). Protects performance (ADR-0023) and respects `prefers-reduced-motion`. |

## Personality

**Professional, serious, trustworthy, and approachable.**

The first three are the foundation. "Approachable" is the differentiator that keeps the site from reading as a generic corporate page.

## Color

Palette: **warm neutrals as the base, petrol blue as the single accent.** Both themes ship (ADR-0028).

| Role       | Light                    | Dark                      | Reason                                                                                                                                   |
| ---------- | ------------------------ | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Background | `#f7f4ef` warm off-white | `#171513` warm near-black | Warm neutrals keep the petrol accent from feeling corporate.                                                                             |
| Surface    | `#ece6dc`                | `#24211d`                 | Secondary surfaces (for example, project entries) separate from the background without shadows.                                          |
| Body text  | `#2b2824`                | `#d9d3c9`                 | Warm, high-contrast text for long reading.                                                                                               |
| Headings   | `#1f1d1a`                | `#f2ede5`                 | Strongest contrast for the hierarchy.                                                                                                    |
| Accent     | `#1f5f74` petrol blue    | `#6bb3c8` light petrol    | Chosen by the owner because it feels like his own color. Petrol sits between blue and green: serious without the generic corporate blue. |
| On accent  | `#ffffff`                | `#0a1519`                 | Text on accent-filled elements.                                                                                                          |

Rules:

- Values are starting points. Each pairing is tuned to meet WCAG AA contrast in both themes before shipping.
- **The accent is used at key moments only:** links, the contact action, focus indicators, and the identity motif. It is not spread over headings, icons, or backgrounds.
- No gradients, glows, or background patterns.

## Typography

| Role        | Typeface           | Reason                                                                                                                                      |
| ----------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Headings    | **Source Serif 4** | A serif gives craft and an editorial, human character to a serious base.                                                                    |
| Body and UI | **Source Sans 3**  | Sister family designed to pair with Source Serif 4: harmony and maximum readability. A serious base that does not compete with the content. |

- Fonts are self-hosted (ADR-0034).
- A type scale with a clear weight hierarchy, defined as tokens (ADR-0017).
- No monospace used as decoration. No uppercase labels with wide letter spacing.

## Identity motif

**Margin notes.** Small editorial annotations next to projects and experience that link to the real decisions behind them (for example, "Why Astro: ADR-0004").

- **Reason:** it shows the AI-driven, decision-documented way of working instead of claiming it (`docs/vision.md`). It is specific to this owner and would not survive a logo swap.
- **Desktop:** notes sit in the margin, next to the text they annotate.
- **Mobile:** there is no margin. Notes are integrated inline in the text flow without breaking reading.
- Notes always link to something real (an ADR, a pull request, a repository). No decorative notes.

## Mobile

Mobile is designed from the start, not adapted at the end:

- No horizontal overflow at any breakpoint.
- Tap targets of at least 44 px.
- Comfortable navigation with one hand.
- The margin notes motif adapts inline (see above).

## Shape and elevation

- A small radius scale with a rule for each size. Not every element is rounded the same.
- Shadows only as elevation markers, never by default. Surfaces separate through color, not shadow.

## Imagery

- A real photo of the owner. No generated avatars or placeholders presented as final.
- No generic illustrations, stock images, or decorative icons.
