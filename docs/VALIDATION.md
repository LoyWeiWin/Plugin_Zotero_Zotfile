# Validation scope

## Earlier recorded checks

The source package supplied with version 5.1.2.1009 records the following results dated 12 November 2026:

| Check | Recorded result | Environment |
| --- | --- | --- |
| Zotero integration | 49 passed | Isolated Zotero 10.0.8 profile on Linux x86_64 |
| Windows path/rename simulations | 22 passed | Node.js with simulated Zotero and file APIs |
| Private Promise adapter | 3 passed | Node.js |

The earlier integration checks covered plugin lifecycle, renaming, source import, attachment conversion, annotation preservation, PDF extraction, filename collisions, tablet workflows, injected conversion failures and settings.

These integration results are historical records from the supplied package. They were not rerun as part of preparing this repository. The two Node.js regression test files are retained and can be rerun using the command in `tests/README.md`.

## Owner confirmation

On 15 November 2026, the owner confirmed that ZotFile had been tested in Zotero. The confirmation did not specify an operating system or individual test cases.

## Repository checks - 15 November 2026

- Reran the 25 existing Node.js regression checks: all passed.
- Built the XPI with Python 3.12.14 and Node.js 24.22.1.
- Compared all 56 files in the rebuilt XPI with the original tested XPI and repository source: all contents matched.
- Confirmed that only four obsolete non-runtime files were omitted from the fresh build.
- Verified the original release checksum and internal Markdown links.

These checks validate the repository preparation and build. They do not constitute a new Zotero integration run.

## Coverage limits

The Windows path simulations do not exercise a native Windows filesystem or Windows Zotero runtime. The earlier Windows launch attempt under Wine stopped before application initialization and supplied no Windows compatibility result.

The recorded integration run did not directly verify macOS, group-library permissions, sync services, encrypted PDFs or third-party wildcard integrations. It did not configure Dropbox sync. The owner's subsequent confirmation does not establish that these cases were tested.

## Release identity

The original XPI in `releases/` has SHA-256 `ecec9760d744665cf0823a67f5dbbfd4e41047fb01ee697846f0498722aeeda9`. The source runtime files match that XPI. Fresh builds exclude four obsolete non-runtime files and use normalized ZIP timestamps, so their archive hashes differ from the original.
