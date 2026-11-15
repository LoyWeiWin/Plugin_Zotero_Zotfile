# Regression checks

From the repository root, run:

```bash
node --test tests/promise.test.cjs tests/windows-paths.test.cjs
```

These existing tests cover three private Promise-adapter cases and 22 Windows path/rename-command cases. They use Node.js built-in modules; no npm packages are required.

The Windows cases simulate Zotero and file APIs. They cover casing, UNC and extended paths, spaces, Unicode, collision handling, case-only renames, cleanup boundaries and rename-result messages. They do not verify a native Windows filesystem or Zotero runtime.

One-off live-profile harnesses, synthetic PDF fixtures and generated test reports are omitted from this repository package. The scope of the earlier integration results is summarized in `docs/VALIDATION.md`.
