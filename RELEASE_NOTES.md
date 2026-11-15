# ZotFile 5.1.2.1009 for Zotero 10

Unofficial compatibility port of ZotFile 5.1.2 by Joscha Legewie and contributors, targeting Zotero 10.0.8. The manifest permits Zotero 10.0.x.

## Included

- Attachment renaming, source-folder import and stored/linked attachment conversion.
- Tablet copy, move and return workflows.
- PDF annotation and bookmark extraction through Zotero's PDF engines.
- Windows path-casing corrections, native case-only renaming and specific skip/error messages.

## Install

Download `zotfile-5.1.2-zotero-10.0.8.xpi`. In Zotero, choose **Tools > Plugins > gear menu > Install Plugin From File**. Configure the plugin through **Tools > ZotFile > Settings**.

The plugin uses the original ZotFile ID and replaces any installed ZotFile version. Updates are manual.

## Validation

Historical validation recorded 49 Linux Zotero 10.0.8 integration checks and 25 Node.js regression checks. The owner confirmed testing in Zotero on 15 November 2026. Detailed platform coverage was not supplied for that manual check.

The included XPI is the original tested binary; repository cleanup did not modify it. See `docs/VALIDATION.md` for the limits of the recorded checks.

SHA-256:

```text
ecec9760d744665cf0823a67f5dbbfd4e41047fb01ee697846f0498722aeeda9  zotfile-5.1.2-zotero-10.0.8.xpi
```

Licence: GNU GPL v3; see `COPYING` and source notices. Original project: https://github.com/jlegewie/zotfile.
