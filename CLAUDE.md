# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Idle clicker game - earn money through digital jobs to fund hacking jobs. Built with React 19, TypeScript, TanStack Router.

## Commands

```bash
pnpm dev          # dev server :3000
pnpm test         # style + lint + vitest
pnpm vitest       # unit tests only
pnpm lint         # oxlint (type-aware)
pnpm style        # prettier check
pnpm style-fix    # prettier write
pnpm build        # production build
pnpm routes-gen   # regenerate route tree
```

## React Style Rules

- Each component should be in its own file named with the same name as the component in PascalCase
- Use named exports over default exports
- for types use `satisfies` over `as` or :Type syntax.
- Never `import * as React` or `import React from 'react'`
- Always `import { useState, useEffect } from 'react'`
- Use `import type` for types when using verbatimModuleSyntax
- Use @/ prefix for internal imports
- Remove all unused imports
- Use `pnpm lint` to check for all errors
- Write function declarations with explicit return types
- Never use React.\* APIs - import hooks/types directly
- Always add ReactElement return type on React Components
- Always add explicit parameter types (no implicit any)
- Prefix unused parameters with underscore
- For useMutation custom hooks postfix the `mutation` name
- Methods passed to method props should be prefixed with handle[method name] and the method props themselves should be prefixed with on[method name] Eg <form onSubmit={handleSubmit} />

## Architecture

**State**: React Context + useReducer in `src/state/`

- `context.tsx` - GlobalStateContext provider
- `actions.ts` - action constants
- `index.ts` - reducer + initial state

**Game Models**: Class-based in `src/models/`

- `IncomeType` - income sources with multipliers, cooldowns, inventory
- `NumberUnit` - large number formatting
- `levels.ts` - multiplier tiers

**Routing**: TanStack Router file-based

- Routes in `src/routes/`
- `routeTree.gen.ts` auto-generated (don't edit)

**Styling**: Tailwind 4 with custom animations (wiggle, progress-bar-stripes)

## Path Alias

`@` → `./src`

## Tooling

- Oxlint (not ESLint) - strict TS, import limits, file size limits
- Prettier with tailwind plugin - sorts classes
- Vitest for tests - place `.test.ts(x)` alongside source
