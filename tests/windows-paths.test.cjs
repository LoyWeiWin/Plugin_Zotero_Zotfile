/* Windows path and command logic under Node with simulated Zotero/IO APIs.
 * These are not native Windows or Windows filesystem integration tests. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const modern = fs.readFileSync(process.env.ZOTFILE_TEST_MODERN_SOURCE || path.join(__dirname, '../modern.js'), 'utf8');

function environment(isWin = true) {
  const paths = isWin ? path.win32 : path.posix;
  const files = new Map(), directories = new Map(), calls = [], rows = [];
  const key = name => {
    let value = paths.normalize(name).replace(/^\\\\\?\\UNC\\/i, '\\\\').replace(/^\\\\\?\\/, '');
    return isWin ? value.toLowerCase() : value;
  };
  function mkdir(name) {
    name = paths.normalize(name);
    if (directories.has(key(name))) return;
    directories.set(key(name), name);
    const parent = paths.dirname(name);
    if (parent !== name) mkdir(parent);
  }
  function put(name, content = 'PDF bytes') {
    mkdir(paths.dirname(name));
    files.set(key(name), { path: name, content, modified: 1000 });
  }
  const preferences = { dest_dir: 'C:\\Root', source_dir: 'C:\\Source', 'tablet.dest_dir': 'C:\\Tablet',
    confirmation_batch_ask: false, confirmation_batch: 10, info_window_duration: 1000 };
  const selected = [], items = new Map();
  function ItemProgress(icon, text) {
    const row = { text, error: false };
    rows.push(row);
    this.setText = text => { row.text = text; };
    this.setError = () => { row.error = true; };
    this.complete = text => { row.text = text; row.complete = true; };
  }
  const descriptions = [];
  const zz = {
    folderSep: isWin ? '\\' : '/', messages_report: [], messages_warning: [], excludeAutorenameKeys: [],
    getPref: name => preferences[name], getFilename: (parent, name) => name,
    getSelectedAttachments: () => selected, checkFileType: att => att.attachmentFilename.toLowerCase().endsWith('.pdf'),
    ZFgetString: name => name, Tablet: { getTabletStatus: att => !!att.tablet },
    progressWindow: () => ({ ItemProgress, addDescription: message => descriptions.push(message), startCloseTimer() {} })
  };
  const IOUtils = {
    async exists(name) { return files.has(key(name)) || directories.has(key(name)); },
    async makeDirectory(name) { mkdir(name); },
    async stat(name) {
      const file = files.get(key(name));
      if (file) return { type: 'regular', lastModified: file.modified };
      if (directories.has(key(name))) return { type: 'directory' };
      throw new Error('Missing file: ' + name);
    },
    async copy(before, after, options) {
      calls.push(['copy', before, after]);
      const file = files.get(key(before));
      if (!file) throw new Error('Missing source');
      if (options.noOverwrite && files.has(key(after))) throw new Error('Destination exists');
      put(after, file.content);
    },
    async setModificationTime(name, value) { files.get(key(name)).modified = value; },
    async remove(name) { calls.push(['remove', name]); files.delete(key(name)); directories.delete(key(name)); },
    async getChildren(name) {
      return [...files.values(), ...[...directories.values()].map(path => ({ path }))]
        .filter(entry => key(entry.path) !== key(name) && key(paths.dirname(entry.path)) === key(name))
        .map(entry => entry.path);
    }
  };
  const Zotero = { isWin, ZotFile: zz, Items: { get: ids => ids.map(id => items.get(id)) },
    getStorageDirectory: () => ({ path: isWin ? 'C:\\Storage' : '/storage' }),
    File: { getValidFileName: name => name.replace(/[<>:"/\\|?*]/g, '') },
    Utilities: { removeDiacritics: name => name }, getMainWindow: () => null, logError() {} };
  const context = vm.createContext({ Zotero, OS: { Path: paths }, IOUtils,
    PathUtils: { join: paths.join, parent: paths.dirname, filename: paths.basename, isAbsolute: paths.isAbsolute },
    Services: { prompt: { confirm: () => true } }, console });
  vm.runInContext(modern, context);
  const owner = context.ZotFileModern;
  owner.patchFileManagement();
  function attachment(name, options = {}) {
    const att = { id: items.size + 1, path: name, ...options,
      async getFilePathAsync() { return await IOUtils.exists(this.path) ? this.path : false; },
      get attachmentFilename() { return paths.basename(this.path); },
      getField() { return options.title || 'Full Text'; },
      isTopLevelItem() { return !!options.topLevel; },
      async fileExists() { return IOUtils.exists(this.path); },
      async relinkAttachmentFile(name) { this.path = name; },
      async renameAttachmentFile(name) {
        calls.push(['native-rename', name]);
        const before = files.get(key(this.path));
        const destination = paths.join(paths.dirname(this.path), name);
        files.delete(key(this.path)); put(destination, before.content); this.path = destination; return true;
      }
    };
    items.set(att.id, att); return att;
  }
  return { zz, owner, files, directories, calls, rows, descriptions, put, mkdir, key, preferences, selected, attachment };
}

for (const [label, before, after] of [
  ['drive-letter case', 'C:\\Research\\paper.pdf', 'c:\\Research\\paper.pdf'],
  ['directory case', 'C:\\Research\\paper.pdf', 'C:\\research\\paper.pdf'],
  ['forward slashes', 'C:/Research/paper.pdf', 'C:\\Research\\paper.pdf'],
  ['relative path components', 'C:\\Research\\drafts\\..\\paper.pdf', 'C:\\Research\\paper.pdf'],
  ['UNC share names', '\\\\SERVER\\Share\\paper.pdf', '\\\\server\\share\\paper.pdf'],
  ['extended drive paths', '\\\\?\\C:\\Research\\paper.pdf', 'C:\\Research\\paper.pdf'],
  ['extended UNC paths', '\\\\?\\UNC\\Server\\Share\\paper.pdf', '\\\\server\\share\\paper.pdf']
]) test('Windows comparisons handle ' + label, () => {
  const { owner } = environment();
  assert.equal(owner.samePath(before, after), true);
});

test('Linux path comparisons remain case-sensitive', () => {
  assert.equal(environment(false).owner.samePath('/papers/A.pdf', '/papers/a.pdf'), false);
});
test('copying to the same Windows file with different casing creates no duplicate', async () => {
  const e = environment(); e.put('C:\\Root\\paper.pdf');
  await e.zz.copyFile('C:\\Root\\paper.pdf', 'c:\\ROOT\\paper.pdf');
  assert.equal(e.files.size, 1); assert.equal(e.calls.length, 0);
});
test('moving to the same Windows file with different casing does not delete it', async () => {
  const e = environment(); e.put('C:\\Root\\paper.pdf');
  await e.zz.moveFile('C:\\Root\\paper.pdf', 'c:\\ROOT\\paper.pdf');
  assert.equal(e.files.size, 1); assert.equal(e.calls.length, 0);
});
test('copies handle spaces, Unicode and case-insensitive filename collisions', async () => {
  const e = environment(); e.put('C:\\Source\\Étude 中文.pdf', 'new PDF'); e.put('D:\\My Papers\\ÉTUDE 中文.PDF', 'existing PDF');
  const after = await e.zz.copyFile('C:\\Source\\Étude 中文.pdf', 'D:\\My Papers', 'Étude 中文.pdf');
  assert.equal(after, 'D:\\My Papers\\Étude 中文-2.pdf');
  assert.equal(e.files.get(e.key(after)).content, 'new PDF');
  assert.equal(e.files.get(e.key('D:\\My Papers\\ÉTUDE 中文.PDF')).content, 'existing PDF');
});
test('case-only linked attachment renames use Zotero native renaming without a numeric suffix', async () => {
  const e = environment(); e.put('C:\\Root\\Paper.PDF'); const att = e.attachment('C:\\Root\\Paper.PDF');
  await e.zz.moveLinkedAttachmentFile(att, 'c:\\root', 'paper.pdf');
  assert.equal(att.attachmentFilename, 'paper.pdf'); assert.equal(e.files.size, 1);
  assert.equal(e.calls[0][0], 'native-rename'); assert.equal(e.calls.filter(call => call[0] === 'copy').length, 0);
});
test('empty-folder cleanup honors Windows casing and never deletes the configured root', async () => {
  const e = environment(); e.mkdir('c:\\ROOT\\Empty');
  await e.zz.removeEmptyFolders('c:\\ROOT\\Empty');
  assert.equal(e.directories.has(e.key('C:\\Root')), true);
  assert.equal(e.directories.has(e.key('C:\\Root\\Empty')), false);
});
test('empty-folder cleanup stays inside the configured root boundary', async () => {
  const e = environment(); e.mkdir('C:\\Root-Other\\Empty');
  await e.zz.removeEmptyFolders('C:\\Root-Other\\Empty');
  assert.equal(e.calls.length, 0);
});
test('missing child PDFs report a missing local file instead of the generic warning', async () => {
  const e = environment(); const att = e.attachment('C:\\Root\\missing.pdf'); e.selected.push(att.id);
  const result = await e.zz.renameSelectedAttachments();
  assert.equal(result[0].status, 'skipped'); assert.match(result[0].reason, /not available locally/);
  assert.match(e.rows[0].text, /locate or download/);
});
test('tablet-tracked PDFs report the tablet return action', async () => {
  const e = environment(); e.put('C:\\Root\\paper.pdf'); const att = e.attachment('C:\\Root\\paper.pdf', { tablet: true }); e.selected.push(att.id);
  const result = await e.zz.renameSelectedAttachments(); assert.match(result[0].reason, /Get from tablet folder/);
});
test('a skipped PDF does not stop other attachments from being renamed', async () => {
  const e = environment(); e.put('C:\\Root\\good.pdf');
  const missing = e.attachment('C:\\Root\\missing.pdf'), good = e.attachment('C:\\Root\\good.pdf');
  e.selected.push(missing.id, good.id); e.zz.renameAttachment = async att => att;
  const result = await e.zz.renameSelectedAttachments();
  assert.deepEqual(Array.from(result, row => row.status), ['skipped', 'renamed']);
});
test('file operation errors identify the failing attachment and preserve the error message', async () => {
  const e = environment(); e.put('C:\\Root\\paper.pdf'); const att = e.attachment('C:\\Root\\paper.pdf'); e.selected.push(att.id);
  e.zz.renameAttachment = async () => { throw new Error('The directory is read-only'); };
  const result = await e.zz.renameSelectedAttachments();
  assert.equal(result[0].status, 'failed'); assert.match(e.rows[0].text, /directory is read-only/);
  assert.equal(e.files.size, 1);
});
test('web snapshots are identified and kept unchanged', async () => {
  const e = environment(); e.put('C:\\Root\\page.html'); const att = e.attachment('C:\\Root\\page.html', { attachmentContentType: 'text/html' }); e.selected.push(att.id);
  const result = await e.zz.renameSelectedAttachments(); assert.match(result[0].reason, /Web snapshot/); assert.equal(e.calls.length, 0);
});
test('excluded file types report the applicable setting', async () => {
  const e = environment(); const att = e.attachment('C:\\Root\\file.exe'); e.selected.push(att.id);
  const result = await e.zz.renameSelectedAttachments(); assert.match(result[0].reason, /excluded in ZotFile Settings/);
});
test('top-level attachments explain the need for a parent reference', async () => {
  const e = environment(); const att = e.attachment('C:\\Root\\paper.pdf', { topLevel: true }); e.selected.push(att.id);
  const result = await e.zz.renameSelectedAttachments(); assert.match(result[0].reason, /parent reference/);
});
test('an empty selection explains what to select', async () => {
  const e = environment(); const result = await e.zz.renameSelectedAttachments();
  assert.equal(result.length, 0); assert.match(e.descriptions[0], /Select a reference/);
});
