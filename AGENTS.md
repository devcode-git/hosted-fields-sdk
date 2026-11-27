# hosted-fields-sdk

The public npm package `hosted-fields-sdk`. It runs on the integrator's page, creates the iframes
that hold the hosted card fields, and talks to them with `window.postMessage`. The page inside the
iframe (the "hosted fields page") is a separate, internal codebase. Card numbers and security codes
are entered and encrypted there; this package never sees them in the clear.

`README.md` is the integrator's guide and is published to npm with the package. This file is for
people and agents changing the SDK.

> **This repository is public, and so is everything in it.** Keep company names, internal host
> names, ticket keys and internal process out of the code, the docs, commit messages and pull
> requests. The build fails if a company name reaches the published package
> (`scripts/check-brand-package.mjs`); nothing checks the rest, so you do.

## Rules that must not break

1. **The public API is a contract.** `HostedFields`, `Field`, `FieldTypes`, the config keys of
   `setup`, the ids and class names of the elements the SDK creates (`hosted-field-<id>`,
   `hosted-field-container-<id>`, `hosted-field-single-iframe`, `hosted-field-container`) are used by
   integrations we cannot see. Add; do not rename or remove.
2. **The message protocol is shared with the hosted fields page.** Integrators choose the SDK
   version and the hosted fields version (the one in `hostedfieldsurl`) independently, and old
   versions of both stay in use. An action the other side does not know is ignored without an
   error. So a new action or message field must be optional, and the release notes and the README
   must say which hosted fields version it needs.
3. **Messages are accepted only from the origin of `hostedfieldsurl`** and sent only to it. Do not
   add a fallback origin and do not post to `'*'`.
4. **`index.d.ts` is written by hand.** Change it in the same pull request as the API.

## Setup and commands

```bash
nvm use && npm ci
npm run build              # lint, then CommonJS to dist/ and ES modules to dist/esm/, minified
npm run eslint             # lint only
npm run check:brand        # the package npm would publish carries no company name (run after build)
npm run check:brand:test   # the guard's own regression cases
```

`npm test` is a placeholder and fails; there are no unit tests yet.

`dist/` is committed. A pull request that changes `src/` also commits the rebuilt `dist/`. The
workflow builds again before it publishes, so npm gets a fresh build either way; the committed copy
is for people who read or install from the repository.

To try a change in an integration, run `npm run build` and `npm pack`, then install the tarball in
the consuming project (`npm i ../hosted-fields-sdk/hosted-fields-sdk-<version>.tgz`).

## Where things are

| Path | What |
| --- | --- |
| `src/index.js` | The exports |
| `src/sdk/api/index.js` | Everything else: `setup`, iframe creation, the message handler, the public functions. State is module-level, so there is one set of hosted fields per page |
| `src/sdk/api/actions.js` | The action names. The hosted fields page declares the same names in its own code |
| `src/sdk/model/field/index.js` | `Field` and `FieldTypes` |
| `index.d.ts` | The published types |
| `scripts/check-brand-package.mjs` | The build guard |
| `CHANGES.md` | Release notes, newest first |

## Gotchas

- **Two render modes.** `renderMode: 'single'` creates one iframe and sends
  `setupSingleIframeContent`; the default, `'multiple'`, creates one iframe per field and sends
  `setupContent` to each. `autoFocusNext` is only sent in `single` mode. Check a change in both.
- **In `multiple` mode the fields cannot see each other.** `get` collects one `formData` per iframe
  and merges them before the callback runs, and the card brand is passed from the card number
  field's iframe to the others with `setCardBrand`.
- **`callback` and `onLoadCallback` are functions that return the function to call.** The SDK calls
  `callback()(formData)`.
- **`reset()` clears the SDK's list of iframes; it does not remove them from the page.** In
  `multiple` mode `setup` appends to that list, so an integration that renders again without
  `reset()` waits in `get` for answers from iframes that are gone.
- **`noAttributeValueFormatting`** makes the input's `id` and `name` exactly the field's, which
  browser autofill needs. Without it the hosted fields page appends `-input`. The default cannot
  change: integrators' CSS targets those ids.
- **Click to Pay** is set up in the single iframe, or in `multiple` mode in the last iframe to load
  and only when `onLoadCallback` is given. Use `single` for it.
- **The `message` listener is added when an iframe loads and never removed.**
- The four field activity messages the page sends (`input`, `focus`, `blur`, `change`) are not
  handled by the SDK.

## Releasing

A merge to `master` publishes to npm when `package.json` has a version npm does not have yet. See
[`docs/releasing.md`](docs/releasing.md).

## Further reading

The full protocol (every action, its payload, direction and minimum versions), the security model
and the decision records are kept in one place, the internal Hosted Fields repository
(`docs/architecture.md` and `docs/adr/` there), and cover this package too. They are not repeated
here.
