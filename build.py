#!/usr/bin/env python3
"""Build the ZotFile Zotero 10 port using Python 3 and Node.js."""
from pathlib import Path
import json
import subprocess
from zipfile import ZipFile, ZipInfo, ZIP_DEFLATED

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT
OUTPUT = ROOT / 'dist'
OUTPUT.mkdir(exist_ok=True)
script = "const fs=require('fs'),vm=require('vm');const out=[];vm.runInNewContext(fs.readFileSync(process.argv[1],'utf8'),{pref:(name,value)=>out.push({name:name.replace(/^extensions\\.zotfile\\./,''),type:typeof value,default:value})});process.stdout.write('var ZotFileSettingsData = '+JSON.stringify(out,null,2)+';\\n');"
data = subprocess.check_output(['node', '-e', script, str(SOURCE / 'defaults/preferences/defaults.js')], text=True)
(SOURCE / 'settings-data.js').write_text(data)
manifest = json.loads((SOURCE / 'manifest.json').read_text(encoding='utf-8'))
path = OUTPUT / 'zotfile-5.1.2-zotero-10.0.8.xpi'
runtime_files = {
    'COPYING', 'bootstrap.js', 'legacy-promise.js', 'manifest.json',
    'modern.js', 'pdf-helper.js', 'pdf-helper.xhtml', 'prefs.js',
    'settings-data.js', 'settings.css', 'settings.js', 'settings.xhtml',
}
runtime_directories = ('chrome/', 'defaults/')
missing = sorted(name for name in runtime_files if not (SOURCE / name).is_file())
if missing:
    raise SystemExit('Missing runtime files: ' + ', '.join(missing))
with ZipFile(path, 'w', ZIP_DEFLATED) as archive:
    for item in sorted(SOURCE.rglob('*')):
        name = item.relative_to(SOURCE).as_posix()
        if not item.is_file():
            continue
        if name not in runtime_files and not name.startswith(runtime_directories):
            continue
        if item.suffix in {'.pyc', '.pyo'} or '__pycache__' in item.parts:
            continue
        info = ZipInfo(name, date_time=(1980, 1, 1, 0, 0, 0))
        info.create_system = 3
        info.external_attr = 0o100644 << 16
        info.compress_type = ZIP_DEFLATED
        archive.writestr(info, item.read_bytes())
print(f"Built ZotFile {manifest['version']}: {path}")
