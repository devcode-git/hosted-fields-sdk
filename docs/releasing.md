# Releasing

How a change reaches npm. This covers the package only; releasing the hosted fields page is
described in its own repository.

## How it works

One workflow, `.github/workflows/build_and_publish.yaml`:

| When | What runs |
| --- | --- |
| Pull request to `master` | `npm ci`, `npm run build` (lints), the build guard and its regression cases |
| Push to `master` | The same, then `npm publish` **if the version in `package.json` is not on npm yet** |

So the version bump is the release switch: a merge that bumps the version publishes it, and a merge
that does not (docs, CI) publishes nothing. There are no release branches and no git tags. The
published package holds `dist/`, `index.d.ts`, `README.md` and `package.json`.

## Checklist

### In the pull request

- [ ] `package.json` `version` is bumped (and `package-lock.json` with it: `npm version <x.y.z> --no-git-tag-version`).
- [ ] `CHANGES.md` has an entry for the version at the top. If the change needs a minimum hosted
      fields version, the entry says "requires hosted fields x.y.z+".
- [ ] `README.md` describes any new option or function, with the same version note. The README is
      what integrators read on npm.
- [ ] `index.d.ts` matches the API.
- [ ] `dist/` is rebuilt with `npm run build` and committed.
- [ ] A new action or message field is optional for the other side: an older hosted fields page
      ignores it, and the SDK still works against that page.
- [ ] Checked in a browser in both render modes, `single` and `multiple`, by installing the packed
      tarball in an integration (see `AGENTS.md`).
- [ ] No company name, internal host name or ticket key in the diff, the commit messages or the pull
      request text. The repository is public.

### After the merge

- [ ] The workflow run on `master` is green and its "Publish to npm" step ran (it is skipped when
      the version already exists).
- [ ] `npm view hosted-fields-sdk version` prints the new version.
- [ ] The protocol table in the internal Hosted Fields repository is updated if an action or its
      payload changed.
- [ ] Projects that should get the change bump their `hosted-fields-sdk` dependency. A project that
      pins an exact version does not move by itself.

## Coordinating with the hosted fields page

The two are released and pinned independently. When a feature needs both:

1. Release the hosted fields page first. A page that understands a new action is harmless to old
   SDKs.
2. Then release the SDK that sends it.
3. An integrator gets the feature only when both their SDK version and the version in their
   `hostedfieldsurl` are new enough. State both minimums in `CHANGES.md` and the README.

## Undoing a release

A published version cannot be changed, and npm does not allow a version number to be reused.

- Publish a fix as the next patch version. That is the normal route.
- If a version must not be installed, deprecate it with a message naming the version to use:
  `npm deprecate hosted-fields-sdk@<bad version> "<message>"`. This needs publish rights on the
  package; the workflow's token has them, individual developers normally do not.
- Projects that already installed the bad version go back by pinning the previous one.

## If the publish step fails

- **The version already exists (E403):** the check before the publish step should have skipped it.
  Bump the version and merge again.
- **Authentication:** the step uses the repository secret `NPM_TOKEN`. An expired token is replaced
  by a repository admin; rerun the failed job afterwards.
