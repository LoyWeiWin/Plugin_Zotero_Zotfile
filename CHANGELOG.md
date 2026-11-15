# Changelog

## Repository preparation - 15 November 2026

- Added installation, build, attribution and release documentation.
- Included the original tested XPI and its SHA-256 checksum.
- Removed obsolete Travis publishing configuration, legacy build files, the old website, the unused bundled PDF extractor and one-off test reports/harnesses.
- Retained the existing Promise and Windows path regression tests.
- Restricted fresh XPI builds to runtime files and the licence.
- Kept version 5.1.2.1009 and all tested plugin runtime files unchanged.
- Followed the supplied Dropbox source layout and archived its upstream readme, recording the version distinction in `docs/SOURCE_ORIGIN.md`.

## 5.1.2.1009 - 12 November 2026

- Corrected Windows path comparisons for drive and directory casing, UNC paths and extended prefixes.
- Used Zotero's native API for case-only linked-file renames.
- Added specific reasons for skipped attachments and continued batches after individual file-operation errors.

This release builds on the Zotero 10 compatibility layer for startup, menus, settings, legacy Promise calls, attachment management and PDF processing.
