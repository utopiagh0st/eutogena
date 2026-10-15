# eutogena — Project Context for Codex

> Purpose: Give Codex durable context so the user does not have to re-explain the project's vision and decisions.
> Last updated: 2026-10-13
>
> This document records currently known context. Treat unconfirmed implementation details as plans, not as facts about the existing codebase. Inspect the repository before making assumptions.

## 1. What eutogena is

**eutogena** is a personal social-relationship mapping app: a place to represent people, relationships between them, events and interactions, and possible future developments. Its central idea is to model human connections as a living network rather than a static contact list.

Visual direction: dark, scientific, biological, and network-oriented. The interface should feel like exploring a system of interconnected people. Current visual work has used a very dark navy/black base and orange accent `#E69F00`.

Possible taglines explored:
- “THE ARCHITECTURE OF HUMAN CONNECTION”
- “Every connection has a history. Every interaction can change the future.”

These are candidate taglines, not necessarily final branding decisions.

## 2. Core areas

### People
- A visual graph/network of people and their connections.
- Select a person to inspect their profile.
- Profiles can contain notes, links, events, and potentially map/location information.
- Relationships should carry meaningful information, not just connect two nodes.
- Intended relationship dimensions include Friendship, Trust, Respect, Romantic Interest, Conflict, Influence, Admiration, Jealousy, Dependence, Communication, Compatibility, and Predictability.
- The graph may represent closeness/distance and use edge colors to communicate relationship types or qualities.

### Events and interaction history
- Record events and interactions involving people.
- Use observations and past interactions as context for understanding how relationships evolve.
- Link events to relevant people and profiles.

### Oracle
An AI-powered feature for generating possible predictions about relationships and future interactions.

Intended behavior:
- Generate predictions on demand and potentially on a daily basis.
- Explain why it produced a prediction; avoid unexplained conclusions.
- Identify missing information and ask questions when more context would materially improve a prediction.
- Support configurable multi-hop reasoning (how far through the relationship network it reasons).
- Potentially estimate impact/probability, while clearly communicating uncertainty and the speculative nature of predictions.
- Offer reminders or follow-up tracking.
- It may suggest changes to a person's profile based on new information, but **must ask for user approval before changing saved data**.
- Predictions should be framed as hypotheses, not facts about what people think or will do. Distinguish recorded observations from inferences and speculation.

## 3. Scale and intended use

The initial concept was a private tool for the user and perhaps a couple of other people, with a possibility of growing to roughly 200 users later. This is a direction, not a fixed requirement. Avoid premature complexity, but do not make choices that needlessly block future growth.

## 4. Technology direction

The planned starting stack is:
- React
- Vite
- TypeScript
- Tailwind CSS
- `@xyflow/react` (React Flow) for the interactive relationship graph
- Browser `localStorage` for the earliest prototype/persistence

Later possibilities:
- Node.js / Express backend
- PostgreSQL database
- AI API integration for the Oracle

**This is the planned direction, not proof that all of these technologies are already installed or implemented.** Inspect `package.json`, the source tree, and existing code before making assumptions or changing dependencies. Keep the first prototype simple and working.

## 5. Current known development context

- The project is named `eutogena`.
- Work has focused on the visual identity and making the interface easier to customize.
- The user has a `src/style.css` file (rather than `src/index.css`) containing the app's styles.
- The CSS uses Tailwind CSS v4 syntax, including `@import "tailwindcss";`.
- A formatted, more readable version of the stylesheet was prepared while preserving its intended styles and responsive layouts. The user may have copied it into `src/style.css`; **verify the current file before relying on this**.
- The stylesheet's known visual palette includes a dark navy/black background and orange `#E69F00`. Do not casually replace the palette.
- Previous frontend work in another project used React, Vite, Tailwind CSS v4, and MapLibre, but that does not mean MapLibre is part of eutogena.

This document does not establish the exact current component tree, working state, package versions, or implemented features. Inspect the actual repository.

## 6. Working preferences

The user prefers:
- Step-by-step explanations that do not skip important details.
- Understanding the code rather than blindly pasting it.
- Clear explanations of what changed, why it changed, and how the pieces work together.
- Practical progress: begin building and learn along the way instead of studying every technology in advance.
- A casual, friendly tone is welcome, but technical accuracy matters.

When teaching or debugging:
1. Explain the goal.
2. Identify the relevant files and existing behavior.
3. Make a focused change rather than rewriting unrelated parts.
4. Explain the change and important concepts.
5. Give concrete commands or steps to test it.
6. Mention assumptions and limitations.

## 7. Instructions for Codex

Before making changes:
1. Inspect the repository structure and relevant files.
2. Check `package.json` and existing scripts/dependencies.
3. Determine what is implemented versus merely planned.
4. Preserve working functionality and the established visual direction.
5. Ask before making major product or architecture decisions that are not covered here.

While implementing:
- Prefer small, understandable, maintainable changes.
- Do not silently add a backend, database, authentication system, or paid AI service unless requested.
- Do not treat speculative relationship predictions as objective truth.
- Do not update saved profiles automatically based on AI output; require explicit approval.
- Do not invent project state. If a feature is missing, say so and propose a next step.
- After a meaningful task, summarize files changed, behavior added or fixed, decisions made, how to test, known limitations, and the suggested next step.
- If an architectural decision or project status changes, update this context document or propose a concise update.

## 8. Suggested first session in Codex

1. Read this file.
2. Inspect the repository without modifying anything.
3. Summarize the current architecture and compare it with the plans above.
4. Identify what already works, what is incomplete, and any obvious blockers.
5. Recommend the next smallest useful implementation step.
6. Wait for the user's go-ahead before broad refactors or major architectural changes.

## 9. Open decisions — do not assume

These are not confirmed final decisions:
- Final tagline and logo.
- Exact graph layout and relationship-edge color rules.
- Exact data model and scoring formulas for relationship dimensions.
- How prediction confidence or probability will be calculated.
- Whether the first release needs accounts or multi-user collaboration.
- When to introduce a backend and database.
- Which AI provider/model will power the Oracle.
- Which features are already implemented in the current repository.

Keep these decisions visible rather than silently choosing defaults that constrain the product.
