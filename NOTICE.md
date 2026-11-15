# Attribution and modification notice

This repository distributes an unofficial Zotero 10 compatibility port of ZotFile 5.1.2 by Joscha Legewie and contributors.

Original project: https://github.com/jlegewie/zotfile

The original project states GNU GPL version 3. The compatibility-layer notice specifies GPL-3.0-or-later. The GPL v3 licence text is provided in `COPYING`; original copyright and licence notices in retained source files are preserved.

Compatibility version 5.1.2.1009 was prepared for Loy on 12 November 2026. Its changes add a Zotero 10 bootstrap, modern menus and settings, a private adapter for legacy Promise usage, file-operation compatibility, modern PDF helpers and Windows path/rename corrections.

Repository preparation on 15 November 2026 adds documentation, an explicit runtime-only build and release checksums. It removes obsolete publishing configuration, unused legacy packaging files, the unused bundled PDF extractor and one-off testing artifacts from the repository. The plugin runtime files and the original release XPI are unchanged.

The owner supplied the Dropbox folder `Research/01_Assets/Plugins/Plugin_Zotero_Zotfile` as a development reference. Its legacy manifest reports version 5.1.3 for Zotero 5-6. Its layout and readme inform this package's presentation; the tested port still identifies its base as 5.1.2. See `docs/SOURCE_ORIGIN.md`.

This repository is not an official release of ZotFile or Zotero.
