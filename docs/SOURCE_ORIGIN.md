# Source origin and development reference

The owner supplied the following Dropbox development reference on 15 November 2026:

`Research/01_Assets/Plugins/Plugin_Zotero_Zotfile`

Its root contains the original flat ZotFile structure: `chrome/`, `defaults/`, `docs/`, a readme, `install.rdf`, `chrome.manifest` and legacy build/update configuration. The `install.rdf` identifies ZotFile 5.1.3 and a Zotero compatibility range of 5.0.0 through 6.0.*. Its readme credits Joscha Legewie and states GNU GPL version 3. That readme is preserved in [UPSTREAM_README.md](UPSTREAM_README.md).

The separately supplied tested Zotero 10 release identifies itself as version 5.1.2.1009, based on ZotFile 5.1.2 and targeting Zotero 10.0.8. Its source files match the runtime contents of the tested XPI.

This repository follows the Dropbox reference's flat source layout and original attribution. The Zotero 10 runtime comes from the tested port. No changes from the legacy 5.1.3 reference have been merged into that runtime, and no claim is made that the two source versions are identical.

The modern `manifest.json`, `bootstrap.js` and Python builder provide the Zotero 10 packaging. The legacy `install.rdf`, `chrome.manifest`, update RDF, old Makefile and Travis publisher are omitted from the active repository build.

The Dropbox reference was inspected without changing its files.
