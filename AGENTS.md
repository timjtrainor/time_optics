# AGENTS.md: AI Collaboration Guide

This document provides essential context for AI models interacting with this project. Adhering to these guidelines will ensure consistency and maintain code quality.

> **Note on Project Stack:** This is a **Next.js / TypeScript** project. 

## 1. Project Overview & Purpose

* **Primary Goal:** TimeOptics is an AI-powered productivity and planning application designed with ADHD-friendly principles. It helps users break down tasks, focus on one thing at a time, and manage both strategic and day-to-day operations seamlessly via features like a Kanban board, integrated timers, and AI-driven goal breakdowns.
* **Business Domain:** Productivity Software, Task Management, ADHD and Executive Functioning Assistance.

## 2. Core Technologies & Stack

* **Languages:** TypeScript, JavaScript, CSS/Tailwind.
* **Frameworks & Runtimes:** Next.js 15 (App Router), React 19, Node.js environment.
* **Databases:** PostgreSQL 18.3, managed via Prisma ORM (`@prisma/client` and `@prisma/adapter-pg`).
* **Key Libraries/Dependencies:** 
  * UI/Styling: Tailwind CSS v4, shadcn/ui components (Radix UI primitives), Framer Motion, `lucide-react`.
  * AI Integration: Vercel AI SDK (`ai`, `@ai-sdk/react`), OpenRouter SDK.
  * State Management: Zustand, Jotai.
  * Drag and Drop: `@hello-pangea/dnd`.
* **Platforms:** Web Backend/Frontend (Containerized with Docker for deployment and development).
* **Package Manager:** Bun.

## 3. Architectural Patterns

* **Overall Architecture:** Monolithic Full-Stack Web Application utilizing the Next.js App Router paradigm (React Server Components combined with Client Components). Data persistence is handled via a containerized PostgreSQL database interfaced through Prisma.
* **Directory Structure Philosophy:**
    * `/app`: Contains the Next.js App Router structure, including pages, layouts, and API routes.
    * `/components`: Contains reusable UI components, heavily utilizing shadcn/ui.
    * `/lib`: Contains utility functions, library wrappers, and shared logic.
    * `/hooks`: Contains custom React hooks for component logic encapsulation.
    * `/prisma`: Contains the database schema (`.prisma`), migration files, and database configuration.
    * `/config`: Contains application-wide configuration settings.
    * `/public`: Static assets (images, icons, etc.) served directly by Next.js.
* **Module Organization:** Logic is modularized based on domain and function, keeping components declarative and pushing complex data-fetching or actions to Server Components and Server Actions.

## 4. Coding Conventions & Style Guide

* **Formatting:** Enforced by Prettier and ESLint (inferred from `.prettierrc`, `eslint.config.mjs`, and `package.json` scripts).
* **Naming Conventions:**
    * Variables, functions: `camelCase`.
    * React Components, Interfaces, Types: `PascalCase`.
    * Files (Next.js routing): `kebab-case` or standard Next.js conventions (`page.tsx`, `layout.tsx`).
    * Database Models (Prisma): `PascalCase` for models, `camelCase` for fields.
* **API Design:** 
    * Primarily utilizes Next.js Server Actions for mutations and Server Components for data fetching.
    * Integration with external AI APIs (OpenRouter, local Ollama) using the Vercel AI SDK standard patterns.
* **Common Patterns & Idioms:**
    * **State Management:** Uses `zustand` for global application state and `jotai` for atomic state needs.
    * **Styling:** Utility-first styling via Tailwind CSS combined with `clsx` and `tailwind-merge` for dynamic classes.
    * **Type Safety:** High reliance on TypeScript strict mode and `zod` for runtime schema validation.
* **Error Handling:** Standard TypeScript try/catch for async operations. Server actions should gracefully handle and return errors to the client for display via `sonner` (toast notifications).

## 5. Key Files & Entrypoints

* **Main Entrypoint:** 
  * Application UI: `app/layout.tsx` and `app/(app)/page.tsx`.
* **Configuration:** 
  * Next.js: `next.config.ts`.
  * Environment: `.env` and `.env.local` (Note: `OPENROUTER_API_KEY` is required).
  * Infrastructure: `docker-compose.yml` and `Dockerfile`.
  * TypeScript: `tsconfig.json`.
* **Database Definition:** `prisma/schema_from_db.prisma`.

## 6. Development & Testing Workflow

* **Local Development Environment:**
    1. **Install Dependencies:** Run `bun install`.
    2. **Start the Environment:** Run `bun docker:start` (Executes `./start.sh` which provisions `.env`, starts Docker containers, waits for DB health, and runs Prisma migrations).
    3. **Configure AI Provider:** Add `OPENROUTER_API_KEY=your_key` to the `.env` file.
    4. **Alternative Dev Server:** Run `bun dev` to start the Next.js development server locally outside Docker (requires the Postgres container to be running).
* **Task Configuration:** 
    * `bun dev`: Starts the Next.js Turbopack development server.
    * `bun lint` / `bun lint:fix`: Runs ESLint.
    * `bun format` / `bun format:check`: Runs Prettier.
* **Testing:** Currently relies on TypeScript compiler checks (`bun run build`) and linting rules. Ensure strict TypeScript adherence for new PRs.
* **CI/CD Process:** Managed via GitHub Actions (found in `.github` directory) for continuous integration checks on push and PR.

## 7. Specific Instructions for AI Collaboration

* **Contribution Guidelines:** Ensure code adheres to Prettier/ESLint formatting rules. Submit pull requests focusing on iterative improvements or bug fixes.
* **Security:** 
  * **Never** hardcode API keys or secrets in source code. 
  * Ensure environment variables (like `OPENROUTER_API_KEY` and `DATABASE_URL`) are loaded from `.env`.
* **Dependencies:** Use `bun add <package>` for adding dependencies to maintain lockfile consistency (`bun.lock`).
* **Commit Messages:** Follow standard concise and descriptive commit practices (e.g., Conventional Commits) to maintain a readable git history.

## 8. Best Practices & Project Rules

To prevent codebase sprawl and maintain a scalable, testable application, all developers and AI agents must adhere to the following rules:

### Code Organization & Modularity
* **Keep the `app/` Directory Lean:** The Next.js `app/` directory should *only* contain routing, layout definition, and basic data fetching orchestration. Move complex business logic, AI orchestration, and database operations into the `/lib` directory.
* **Feature-Based Grouping:** For large features, group related components, hooks, and types together (e.g., `/components/planning/`, `/lib/planning/`) rather than creating massive flat directories.
* **Component Splitting:** Any React component exceeding 250 lines should be evaluated for splitting into smaller, single-responsibility sub-components.

### AI Integration & Agent Management (OpenRouter/Ollama)
* **Centralized Initialization:** Never instantiate the Vercel AI SDK providers (`createOpenRouter` or `createOllama`) directly inside API routes. Always use the centralized `getAgentModel` factory in `lib/ai.ts` to ensure user preferences (provider, model, endpoints) are respected and centralized.
* **Agent Definitions:** Do not hardcode system prompts or agent roles inside individual API routes. Define them centrally in configuration files (e.g., `lib/config.ts`) or the database so they can be easily reviewed, updated, and re-used.
* **Structured Output Validation:** Always use `zod` and the AI SDK's `generateObject` or `streamObject` for expected structured outputs. Strictly validate the AI's response before inserting it into the database to prevent data corruption.
* **Resilience:** Wrap external OpenRouter/Ollama API calls in try/catch blocks. Ensure the UI gracefully surfaces errors (using `sonner` toasts) if the AI provider is rate-limited or offline.

### Testing Strategy
* **Unit Testing Foundation:** As the project scales, ensure that core business logic, utility functions in `lib/`, and data transformation routines are written as pure functions. This enables easy testability once a framework like Vitest or Jest is integrated.
* **Testing AI Logic:** AI orchestration functions should be designed so that the underlying `LanguageModel` can be mocked. This allows testing how the application behaves when the AI returns malformed JSON or unexpected hallucinations.
