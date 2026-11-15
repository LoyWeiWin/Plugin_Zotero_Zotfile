# Release files

`zotfile-5.1.2-zotero-10.0.8.xpi` is the original tested version 5.1.2.1009. Its bytes are unchanged from the supplied package.

The checksum is in `SHA256SUMS`. Verify it from this directory:

```bash
sha256sum -c SHA256SUMS
```

On Windows PowerShell:

```powershell
Get-FileHash .\zotfile-5.1.2-zotero-10.0.8.xpi -Algorithm SHA256
```

Fresh builds in `dist/` contain the same runtime file contents, with repository-only files excluded and normalized ZIP timestamps. They have a different archive hash from this original release.
