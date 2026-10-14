# AGENTS.md

## Project Overview

`mcp-flow-server` is a Next.js application with a workflow editor. The codebase separates editor components, workflow domain logic, UI primitives, and application routes.

When modifying this project, prioritize:

- Correctness and compatibility with the installed dependencies.
- Clear separation between UI, editor state, and workflow logic.
- Type safety and maintainable React components.
- Minimal, focused changes that preserve existing behavior.
- Consistent patterns with the surrounding codebase.

## Mandatory Next.js Documentation Rules

**Do not assume this project uses the Next.js APIs, conventions, or file structure you already know.**

Before writing or modifying Next.js code:

1. Locate the installed Next.js package relative to the file being modified. In a monorepo, the package may not be visible from the repository root.
2. Read the relevant documentation under `node_modules/next/dist/docs/`.
3. Check the installed implementation and documentation for breaking changes, deprecated APIs, and version-specific conventions.
4. Follow the installed version's guidance rather than relying on examples from older Next.js versions.
5. If the documentation is unavailable, inspect the installed package and existing project patterns before proceeding. Do not invent APIs or silently assume compatibility.

The repository includes a generated Next.js agent-rules block. Preserve it:

- Do not remove or rewrite the `BEGIN:nextjs-agent-rules` and `END:nextjs-agent-rules` block.
- Its contents are maintained by `next dev`.
- If the block appears in a diff, verify the source at `node_modules/next/dist/server/lib/generate-agent-files.js` before changing it.
- Do not edit generated content merely to make the diff look cleaner.

## Project Structure

```text
mcp-flow-server/
├── components/
│   ├── editor/
│   │   ├── editor-context.tsx
│   │   └── flow-types.ts
│   └── ui/
│       └── button.tsx
├── lib/
│   └── utils.ts
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── lib/
│       └── workflow/
│           ├── connection.ts
│           ├── factory.ts
│           ├── node-catalog.ts
│           ├── samples.ts
│           └── types.ts
├── AGENTS.md
├── components.json
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json
```

## Architecture and Ownership

### Application Routes: `src/app/`

- `page.tsx` is the main application entry point.
- `layout.tsx` defines the root application layout and shared providers.
- `globals.css` contains global styling and design foundations.
- Follow the installed Next.js conventions for routing, rendering, metadata, and server/client boundaries.
- Keep route components focused on page composition. Move reusable UI and domain logic into their appropriate modules.

### Editor Components: `components/editor/`

- `editor-context.tsx` owns or coordinates shared editor state and context.
- `flow-types.ts` defines editor-facing flow types.
- Keep editor interactions, state transitions, and component rendering clearly separated where practical.
- Avoid duplicating workflow domain types in editor components.
- Preserve existing node and connection behavior when changing editor state management.
- Follow the installed React and Next.js rules for hooks, context, and client components.

### Workflow Domain: `src/lib/workflow/`

- `types.ts`: canonical workflow domain types and shared contracts.
- `connection.ts`: connection-related logic and validation.
- `factory.ts`: workflow or node construction and initialization.
- `node-catalog.ts`: node definitions, registration, or catalog metadata.
- `samples.ts`: sample workflows and example data.

Keep domain logic independent of presentation whenever practical.

When modifying this area:

- Reuse existing types and factories rather than duplicating definitions.
- Keep node definitions consistent with the catalog and factory.
- Validate connections against the actual domain model.
- Preserve stable identifiers and workflow serialization expectations.
- Keep sample workflows aligned with the current types and supported node definitions.
- Avoid introducing UI dependencies into domain modules without a clear reason.

Confirm each module's actual responsibilities in its source code before making assumptions based on its filename.

### Shared UI: `components/ui/`

- Prefer existing UI primitives, such as `button.tsx`, over duplicate implementations.
- Maintain consistent variants, accessibility behavior, and styling conventions.
- Keep shared components reusable and avoid coupling them to a specific workflow node.

### Utilities: `lib/`

- `utils.ts` contains shared utilities.
- Reuse existing helpers when appropriate.
- Avoid creating duplicate utilities with slightly different behavior.
- Keep utilities small, typed, and focused.

### Static Assets: `public/`

- Use existing assets where appropriate.
- Avoid adding assets when existing CSS, components, or icons can meet the requirement.
- Do not modify unrelated assets.

## Development Conventions

### TypeScript

- Preserve strict type safety.
- Avoid `any`, unnecessary type assertions, and non-null assertions.
- Use existing domain types wherever possible.
- Keep public function parameters and return values explicit when this improves clarity.
- Model optional values and invalid states accurately.
- Update related types and consumers together when changing a shared contract.

### React and Next.js

- Read the installed Next.js documentation before changing framework-specific code.
- Use the correct server/client component boundary for the installed version.
- Add client-side behavior only where required by interactivity or client-only APIs.
- Avoid unnecessary effects, duplicated state, and excessive prop drilling.
- Keep components focused and reusable.
- Follow existing naming, import, and file organization conventions.

### Styling and UI

- Inspect `globals.css`, `components.json`, and existing components before introducing new styling patterns.
- Reuse existing design tokens, utility classes, and component variants.
- Keep the interface consistent across the editor.
- Ensure interactive elements have accessible names, keyboard support, and appropriate focus states.
- Account for loading, empty, error, and disabled states when relevant.
- Avoid unrelated visual redesigns when implementing a targeted feature.

### Workflow Editor Integrity

- Treat workflow types and domain logic as shared contracts.
- Keep node creation, catalog definitions, and connection validation consistent.
- Validate incompatible or missing connection endpoints.
- Avoid silently discarding workflow data during updates.
- Preserve existing workflows when changing schemas; introduce explicit migration or compatibility logic when necessary.
- Handle invalid states deliberately rather than hiding errors.
- Keep editor state updates predictable and avoid accidental mutation of shared objects.

## Dependency and Configuration Rules

- Inspect `package.json` before adding dependencies or choosing commands.
- Prefer installed packages and existing project abstractions.
- Avoid adding dependencies for functionality that can be implemented cleanly with current tools.
- Do not edit `package-lock.json` manually.
- Preserve existing TypeScript, ESLint, and Next.js configuration unless a change is necessary.
- Never modify generated files to work around an underlying configuration issue without understanding the source.

## Validation and Testing

Before considering a change complete:

1. Review the relevant implementation and surrounding call sites.
2. Run the applicable checks defined in `package.json`.
3. Run linting and TypeScript checks when available.
4. Run relevant tests if the project provides them.
5. For UI changes, verify the affected interaction and its important states when practical.
6. For workflow changes, verify node creation, connection validation, and type consistency as applicable.
7. Review the final diff for unrelated changes, generated-file modifications, and accidental regressions.

Use the actual scripts defined in `package.json`; do not assume command names or test infrastructure exist.

If a check cannot be run, state which check was skipped and why. Never claim a test passed unless it was actually executed successfully.

## Change Management

- Make the smallest coherent change that solves the problem.
- Follow existing conventions unless there is a concrete reason to change them.
- Avoid unrelated refactoring, renaming, formatting, or dependency upgrades.
- Update documentation and sample data when a change affects their accuracy.
- Do not introduce placeholder implementations, fabricated API contracts, or silently swallowed errors.
- Explain important architectural decisions and compatibility considerations in the final summary.

## Completion Criteria

A task is complete when:

- The requested behavior is implemented.
- Relevant types and dependent modules remain consistent.
- Existing functionality is preserved unless explicitly changed.
- Applicable validation checks have been run.
- The final diff contains only intentional changes.
- Any remaining limitations or unverified behavior are clearly documented.
