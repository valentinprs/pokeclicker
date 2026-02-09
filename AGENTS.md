# Pokeclicker Workspace Notes for Agents

This project is split into **two repositories**:

1. **Main game repo**: `pokeclicker` (this workspace root)
2. **Translations repo**: `pokeclicker-translations` (usually sibling at `../pokeclicker-translations`)

In the main repo, translations are also referenced as a git submodule at:
- `src/translations` -> `https://github.com/pokeclicker/pokeclicker-translations.git`

## How to work across repos

- Put gameplay/code/build changes in `pokeclicker`.
- Put locale string changes in `pokeclicker-translations`.
- If the submodule in `pokeclicker/src/translations` is used, keep it synced with `npm run tl:init` or `npm run tl:update`.
- Never copy `../pokeclicker-translations/locales/*` into tracked files of `pokeclicker`.
- `pokeclicker/src/translations` must stay a git submodule (gitlink), not a directory of versioned JSON files.

## Main repo commands (`pokeclicker`)

Run all commands from the root of the main repo:

```bash
# One-shot clean setup (installs npm deps + initializes translation submodule)
npm run clean

# Start local development (watch mode + local web server)
npm start

# Build once (development build)
npm run build

# Run full checks (scripts tests + eslint + stylelint)
npm test

# Run Vitest only
npm run vitest

# Lint and autofix scripts
npm run eslint
npm run eslint-fix

# Lint and autofix styles
npm run stylelint
npm run stylelint-fix

# Initialize/update translation submodule
npm run tl:init
npm run tl:update

# Production website build into docs/
npm run website
```

## Quick expectations for automation agents

- Do not commit unrelated generated files unless requested.
- Before finalizing a code change in `pokeclicker`, run at least `npm run build` and `npm test` when feasible.
- When adding new translatable keys in the main repo, also update `pokeclicker-translations`.
