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
