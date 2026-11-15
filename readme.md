# ZotFile: Advanced PDF Management for Zotero 10

An unofficial compatibility port of [Joscha Legewie's ZotFile 5.1.2](https://github.com/jlegewie/zotfile), prepared for Loy.

The repository follows the flat source layout of the development reference supplied from Dropbox, including `chrome/` and `defaults/`. That reference identifies itself as legacy ZotFile 5.1.3; the tested Zotero 10 port retains its own version and source. See [docs/SOURCE_ORIGIN.md](docs/SOURCE_ORIGIN.md).

ZotFile manages Zotero attachments: rename files using reference metadata, move and link attachments, import files from a source folder, exchange PDFs with a tablet folder, and extract PDF annotations and bookmarks.

| Item | Value |
| --- | --- |
| Plugin version | 6.0.0 |
| Tested Zotero version | 10.0.8 |
| Manifest compatibility | Zotero 10.0.8 |
| Plugin ID | `zotfile@columbia.edu` |
| Licence | GNU GPL v3; see [COPYING](COPYING) and source notices |

## Install

1. Download [zotfile-6.0.0.xpi](releases/zotfile-6.0.0.xpi). On GitHub, use **Download raw file** on the file page.
2. In Zotero, open **Tools > Plugins**.
3. Open the gear menu, choose **Install Plugin From File**, and select the XPI.
4. Open **Tools > ZotFile > Settings** to configure folders and filename rules.
5. Select references or file attachments, then use **Tools > ZotFile** or the ZotFile item context menu.

This port uses the original ZotFile plugin ID, so installing it replaces another installed ZotFile version. Existing ZotFile preferences are retained. Automatic updates are disabled; future compatibility releases must be installed manually.

## Features and limits

- Author/year/title filename rules and custom wildcards.
- Manual and automatic attachment renaming and source-folder import.
- Conversion between stored and linked attachments, with collision handling.
- Tablet copy, move and return workflows, project folders and saved searches.
- PDF annotation and bookmark extraction through Zotero's PDF engines.
- Windows path comparisons that account for casing, UNC paths and extended path prefixes.
- Specific messages for missing files, tablet tracking and other skipped attachments.

Linked attachments are limited to personal libraries. Multi-file web snapshots remain stored. The modern interface is in English; original translations remain in the source. Legacy Poppler/PDF.js extraction and annotation-note formatting settings are not used by the modern PDF helpers. The former saved-search subfolder restriction context menu is not exposed.

## Build

Install Python 3 and Node.js, then run from the repository root:

```bash
python3 build.py
```

On Windows, `py -3 build.py` can be used if Python is installed through the Python launcher. Node.js must be on your PATH.

The output is `dist/zotfile-5.1.2-zotero-10.0.8.xpi`. No npm or pip packages are required. The builder regenerates `settings-data.js` from the default preferences and includes only plugin runtime files and the licence.

The XPI in `releases/` is the original tested binary, unchanged. A fresh build omits four non-runtime files from that original archive: its old `.gitignore`, Travis configuration, Makefile and upstream readme. Runtime file contents match the tested release; the ZIP hash differs because the packaging is cleaned up. See [releases/README.md](releases/README.md).

## Source and attribution

Original ZotFile: Joscha Legewie and contributors. This port is independently maintained and is not an upstream ZotFile release. Copyright notices in the source are preserved. See [NOTICE.md](NOTICE.md), [COPYING](COPYING) and the [archived upstream readme](docs/UPSTREAM_README.md).

The compatibility modules replace legacy startup, menus, settings, Promise, file-operation and PDF APIs. Repository preparation on 15 November 2026 changes documentation and packaging only; the tested plugin runtime is unchanged.

To upload this package to GitHub, extract the repository ZIP, create a repository such as `zotfile-zotero10`, and upload the contents of this folder with `README.md` at the repository root. Use [RELEASE_NOTES.md](RELEASE_NOTES.md) for a release tagged `v6.0.0` and attach the XPI from `releases/`.
