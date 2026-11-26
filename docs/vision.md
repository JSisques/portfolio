# Vision

Personal website and portfolio of Javier Plaza Sisqués.

## Purpose

A **professional showcase**. The site does not sell services. It demonstrates who I am as a professional: what I do, my level, and the work I have built.

Current situation: employed (not freelance). The site is not optimized for job hunting or client acquisition.

## Positioning

A modern engineering profile: software built by directing AI harnesses and agentic workflows with judgment, not by typing every line by hand. The value shown is problem definition, architecture decisions, and verification of AI output.

This is demonstrated in two places:

- **Site content:** woven into existing sections, not a dedicated section. Each project explains how it was built (harnesses, workflow, decisions), and About me summarizes the approach. Showing it in concrete examples is more credible than claiming it.
- **This repository:** a living proof of the process, with decisions (ADRs), agent configuration, and workflow visible to anyone who inspects it. This requires the repository to be public.

## Audience

- Recruiters and technical profiles (CTOs, engineers) who want to quickly understand my profile.
- Potential freelance contacts as a secondary audience.

## Success criteria

A visitor understands within seconds what I do and what level I work at, and leaves with a good impression.

## Content

- Projects: selected GitHub repositories, with live data from GitHub and local, translated narrative (ADR-0002).
- Languages: Spanish (default) and English (ADR-0003).

## Visual identity

Target impression: **professional, serious, trustworthy, and approachable**.

- **Professional, serious, trustworthy** are the foundation: restrained layout, strong typography, generous whitespace, and clear hierarchy.
- **Approachable** is the differentiator, so the site does not read as a generic corporate page: warm neutrals, a real photo, first-person copy, and a direct tone.

The full visual direction (dials, palette, typography, identity motif) lives in `DESIGN.md`.

## Scope for 0.1.0

Sections:

- **About me:** who I am and what I do, with at most a one-line stack summary.
- **Experience:** roles, responsibilities, and impact, without confidential details.
- **Projects:** featured GitHub repositories (ADR-0002).
- **Contact:** direct links (`hello@jsisques.net`, LinkedIn, GitHub; ADR-0008) plus a contact form delivered by email (ADR-0007). The form requires spam protection and a minimal privacy notice (GDPR), because it collects personal data.
- **Downloadable CV:** PDF in Spanish and English, generated from the site content plus CV-only data. No CV page is published (ADR-0029).

Out of scope for 0.1.0:

- **Blog:** only valuable with consistent writing. Revisit when content exists.
- **Standalone skills section:** the stack is shown in context, inside projects and experience.

## Open questions

- Which projects to feature and what each one demonstrates (deferred).
