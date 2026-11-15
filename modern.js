/* ZotFile 5.1.2 compatibility port for Zotero 10.0.8. GPL-3.0-or-later. */
var ZotFileModern = {
  windows: new Map(), progress: new Set(), helpers: new Map(),
  pending: Promise.resolve(), settingsWindow: null, active: false,

  comparisonPath(path) {
    let value = OS.Path.normalize(path);
    if (Zotero.isWin) {
      value = value.replace(/^\\\\\?\\UNC\\/i, "\\\\").replace(/^\\\\\?\\/, "");
      value = value.toLowerCase();
    }
    return value;
  },

  samePath(before, after) {
    return this.comparisonPath(before) === this.comparisonPath(after);
  },

  async start({ rootURI, version }) {
    this.rootURI = rootURI;
    this.version = version;
    this.active = true;
    const zz = Zotero.ZotFile;
    zz.modern = this;
    zz.folderSep = Zotero.isWin ? "\\" : "/";
    zz.isZotero6OrLater = true;
    zz.Tablet.tag = zz.getPref("tablet.tag");
    zz.Tablet.tagMod = zz.getPref("tablet.tagModified");
    zz.ffPrefs = Services.prefs.getBranch("browser.download.");
    zz.setPref("version", version);
    this.patchProgress();
    this.patchMetadata();
    this.patchFileManagement();
    this.patchPDF();
    this.patchNotifier();
    zz.openPreferenceWindow = () => this.openSettings();
    zz.openSubfolderWindow = () => this.openSettings("tablet");
    zz.chooseDirectory = () => this.chooseDirectory();
    zz.notifierID = Zotero.Notifier.registerObserver(zz.notifierCallback, ["item"], "zotfile-modern");
    for (const win of Zotero.getMainWindows()) this.addWindow(win);
  },

  dispatch(operation) {
    this.pending = this.pending.catch(() => {}).then(async () => {
      if (!this.active) return;
      try { return await operation(); }
      catch (error) {
        Zotero.logError(error);
        Services.prompt.alert(Zotero.getMainWindow(), "ZotFile", String(error.message || error));
      }
    });
    return this.pending;
  },

  addWindow(win) {
    if (this.windows.has(win)) return;
    const doc = win.document;
    const tools = doc.getElementById("menu_ToolsPopup");
    if (!tools) return;
    const installed = [];
    const addMenu = (parent, id) => {
      const menu = doc.createXULElement("menu");
      menu.id = id;
      menu.setAttribute("label", "ZotFile");
      const popup = doc.createXULElement("menupopup");
      menu.appendChild(popup);
      parent.appendChild(menu);
      installed.push(menu);
      popup.addEventListener("popupshowing", event => {
        if (event.target !== popup) return;
        this.buildMenu(win, popup);
      });
      this.buildMenu(win, popup);
    };
    addMenu(tools, "zotfile-modern-tools");
    const context = doc.getElementById("zotero-itemmenu");
    if (context) addMenu(context, "zotfile-modern-context");
    const tree = doc.getElementById("zotero-collections-tree");
    const update = () => {
      if (Zotero.ZotFile.getPref("tablet")) this.dispatch(() => Zotero.ZotFile.Tablet.updateModifiedAttachmentsSearch());
    };
    tree?.addEventListener("click", update);
    this.windows.set(win, { installed, tree, update });
  },

  buildMenu(win, popup) {
    const doc = win.document, zz = Zotero.ZotFile;
    popup.replaceChildren();
    const selected = win.ZoteroPane?.itemsView ? win.ZoteroPane.getSelectedItems() : [];
    const hasAttachments = selected.some(item => item.isAttachment() || item.isRegularItem() && item.getAttachments().length);
    const command = (label, name, callback, disabled = false) => {
      const entry = doc.createXULElement("menuitem");
      entry.setAttribute("label", label);
      entry.setAttribute("data-zotfile-command", name);
      entry.disabled = disabled;
      entry.addEventListener("command", () => this.dispatch(callback));
      popup.appendChild(entry);
    };
    const separator = () => popup.appendChild(doc.createXULElement("menuseparator"));
    command("Rename and move attachments…", "rename", () => zz.renameSelectedAttachments(), !hasAttachments);
    command("Attach file from source folder…", "attach", () => zz.attachFileFromSourceDirectory(), !selected.length);
    separator();
    command("Extract annotations to notes", "annotations", () => zz.pdfAnnotations.getAnnotations(), !hasAttachments);
    command("Get PDF table of contents", "outline", () => zz.pdfOutline.getOutline(), !hasAttachments);
    if (zz.getPref("tablet")) {
      separator();
      command("Send to tablet folder", "tablet-send", () => zz.Tablet.sendSelectedAttachmentsToTablet(), !hasAttachments);
      command("Update tablet files", "tablet-update", () => zz.Tablet.updateSelectedTabletAttachments(), !hasAttachments);
      command("Get from tablet folder", "tablet-get", () => zz.Tablet.getSelectedAttachmentsFromTablet(), !hasAttachments);
      let folders = [];
      if (zz.getPref("tablet.projectFolders") === 2) folders = JSON.parse(zz.getPref("tablet.subfolders"));
      else if (zz.getPref("tablet.projectFolders") === 1 && selected.length) {
        const first = selected[0].isAttachment() ? Zotero.Items.get(selected[0].parentID) : selected[0];
        if (first?.isRegularItem()) folders = zz.Utils.getCollectionPathsOfItem(first).map(path => ({ path, label: path }));
        folders.forEach((folder, i) => { zz.projectPath[i] = folder.path; });
      }
      folders.slice(0, 15).forEach((folder, i) => command("Send to: " + folder.label, "tablet-project-" + i,
        () => zz.Tablet.sendSelectedAttachmentsToTablet(i), !hasAttachments));
      command("Create tablet saved searches", "tablet-searches", () => zz.Tablet.createSavedSearch("both"));
      command("Show tablet file", "tablet-show", () => zz.Tablet.showTabletFile(), !hasAttachments);
    }
    separator();
    command("Settings…", "settings", () => this.openSettings());
  },

  removeWindow(win) {
    const state = this.windows.get(win);
    if (state) {
      state.installed.forEach(element => element.remove());
      state.tree?.removeEventListener("click", state.update);
    }
    this.windows.delete(win);
    this.helpers.get(win)?.browser.destroy();
    this.helpers.delete(win);
  },

  async stop() {
    this.active = false;
    const zz = Zotero.ZotFile;
    if (zz?.notifierID !== null) Zotero.Notifier.unregisterObserver(zz.notifierID);
    if (zz) zz.notifierID = null;
    await this.pending.catch(error => Zotero.logError(error));
    this.settingsWindow?.close();
    this.settingsWindow = null;
    for (const win of [...this.windows.keys()]) this.removeWindow(win);
    for (const progress of this.progress) progress.close();
    this.progress.clear();
    if (Zotero.ZotFile?.modern === this) delete Zotero.ZotFile;
  },

  patchProgress() {
    const zz = Zotero.ZotFile, owner = this;
    zz.ProgressWindow = function () {
      const progress = new Zotero.ProgressWindow({ closeOnClick: true });
      owner.progress.add(progress);
      const Item = progress.ItemProgress;
      progress.ItemProgress = function (icon, text) {
        const item = new Item("attachmentPDF", text);
        item.setIcon = () => {};
        item.complete = title => { item.setText(title); item.setProgress(100); };
        return item;
      };
      return progress;
    };
    const originalInfo = zz.infoWindow.bind(zz);
    zz.infoWindow = (title, message, time, callback) => {
      if (callback) {
        const text = typeof message === "object" ? [...(message.lines || []), message.txt || ""].join("\n") : String(message);
        if (Services.prompt.confirm(Zotero.getMainWindow(), title, text)) Promise.resolve(callback()).catch(error => Zotero.logError(error));
        return null;
      }
      return originalInfo(title, message, time);
    };
  },

  patchNotifier() {
    const zz = Zotero.ZotFile;
    zz.notifierCallback = { notify: async (event, type, ids) => {
      if (!this.active || event !== "add" || type !== "item") return;
      const attachments = Zotero.Items.get(ids).filter(item => item.isAttachment() && item.parentID);
      const excluded = new Set(zz.excludeAutorenameKeys);
      const rename = attachments.filter(att => !excluded.has(att.key) && !excluded.has(att.parentItem.key));
      // Consume one-shot exclusions even when automatic renaming is disabled.
      // Otherwise a manual import can suppress an unrelated future import.
      for (const att of attachments) {
        zz.excludeAutorenameKeys = zz.excludeAutorenameKeys.filter(key => key !== att.key && key !== att.parentItem.key);
      }
      const mode = zz.getPref("automatic_renaming"), outline = zz.getPref("pdfOutline.getToc");
      if (mode === 1 && !outline) return;
      setTimeout(() => this.dispatch(async () => {
        if (mode !== 1) for (let att of rename) {
          if (!att.id || !att.isImportedAttachment() || !zz.checkFileType(att) || !await att.fileExists()) continue;
          const parent = att.parentItem;
          if (att.attachmentFilename === zz.getFilename(parent, att.attachmentFilename)) continue;
          const count = Zotero.Items.get(parent.getAttachments()).filter(zz.checkFileType).length;
          if ((mode === 2 || mode === 3 && count > 1) && !Services.prompt.confirm(Zotero.getMainWindow(), "ZotFile",
            "Rename and move this new attachment?\n\n" + att.attachmentFilename)) continue;
          att = await zz.renameAttachment(att);
          const progress = zz.progressWindow(zz.ZFgetString("general.newAttachmentRenamed"));
          new progress.ItemProgress("attachmentPDF", att.attachmentFilename).setProgress(100);
          progress.startCloseTimer();
        }
        if (outline) await zz.pdfOutline.getOutline(attachments.filter(att => att.id).map(att => att.id));
      }), 100);
    } };
  },

  patchMetadata() {
    const zz = Zotero.ZotFile;
    const parse = att => new DOMParser().parseFromString(att.getNote() || "", "text/html");
    const element = doc => doc.querySelector("#zotfile-data, [title*='lastmod'][title*='projectFolder']");
    zz.Utils.parseHTML = text => {
      const doc = new DOMParser().parseFromString(text, "text/html");
      const result = Zotero.getMainWindow().document.createDocumentFragment();
      for (const node of [...doc.body.childNodes]) result.appendChild(node.cloneNode(true));
      return result;
    };
    zz.Utils.getCollectionPathsOfItem = item => item.getCollections().map(id => {
      const names = [], seen = new Set();
      while (id && !seen.has(id)) {
        seen.add(id);
        const collection = Zotero.Collections.get(id);
        if (!collection) break;
        names.unshift(collection.name);
        id = collection.parentID;
      }
      return names.join(zz.folderSep);
    });
    zz.Tablet.createSavedSearch = async which => {
      const searches = [];
      if (which === "tablet" || which === "both") {
        const search = new Zotero.Search();
        search.libraryID = Zotero.Libraries.userLibraryID;
        search.name = "Tablet Files";
        search.addCondition("tag", "contains", zz.Tablet.tag);
        search.addCondition("includeParentsAndChildren", "true");
        search.addCondition("noChildren", "true");
        searches.push(await search.saveTx());
      }
      if (which === "tablet_modified" || which === "both") {
        const search = new Zotero.Search();
        search.libraryID = Zotero.Libraries.userLibraryID;
        search.name = "Tablet Files (modified)";
        search.addCondition("tag", "is", zz.Tablet.tagMod);
        searches.push(await search.saveTx());
      }
      return searches;
    };
    zz.Tablet.getInfo = (att, key) => {
      const node = element(parse(att));
      let value;
      if (node) value = JSON.parse(node.getAttribute("title"))[key];
      else value = att.getNote().match(new RegExp(key + "\\{([^}]*)\\}"))?.[1];
      if (value === undefined || value === null) return "";
      if (key === "location") value = String(value).replace("[BaseFolder]", zz.getPref("tablet.dest_dir"));
      if (["location", "projectFolder"].includes(key)) value = Zotero.isWin ? String(value).replace(/\//g, "\\") : String(value).replace(/\\/g, "/");
      return value;
    };
    zz.Tablet.addInfo = (att, data) => {
      const doc = parse(att);
      let node = element(doc);
      if (!node) {
        node = doc.createElement("p");
        node.id = "zotfile-data";
        node.style.color = "#cccccc";
        node.textContent = "(hidden zotfile data)";
        doc.body.appendChild(node);
      }
      const old = node.getAttribute("title") ? JSON.parse(node.getAttribute("title")) : {};
      data = { ...data };
      if (data.location && zz.getPref("tablet.dest_dir_relativePath")) {
        const base = zz.getPref("tablet.dest_dir");
        if (base && data.location.startsWith(base + zz.folderSep)) data.location = "[BaseFolder]" + data.location.slice(base.length);
      }
      node.setAttribute("title", JSON.stringify({ ...old, ...data }));
      att.setNote(doc.body.innerHTML);
    };
    zz.Tablet.clearInfo = att => {
      const doc = parse(att);
      element(doc)?.remove();
      att.setNote(doc.body.innerHTML.replace(/(?:lastmod|mode|location|projectFolder)\{[^}]*\};?/g, ""));
    };
    zz.Tablet.updateModifiedAttachmentsSearch = async () => {
      if (!zz.Tablet.checkSelectedSearch()) return;
      const attachments = await zz.Tablet.getModifiedAttachmentsOnTablet();
      await Zotero.DB.executeTransaction(async () => {
        for (const att of attachments) {
          zz.Tablet.addTabletTag(att, zz.Tablet.tagMod);
          await att.save();
          await Zotero.Items.get(att.parentID).save();
        }
      });
    };
  },

  patchFileManagement() {
    const zz = Zotero.ZotFile;
    zz.copyFile = async (source, target, filename) => {
      const destination = filename === undefined ? target : PathUtils.join(target, filename);
      if (this.samePath(source, destination)) return source;
      return this.copyUnique(source, destination);
    };
    zz.moveFile = async (source, target, filename) => {
      const destination = filename === undefined ? target : PathUtils.join(target, filename);
      if (this.samePath(source, destination)) return source;
      const copied = await this.copyUnique(source, destination);
      try { await IOUtils.remove(source); }
      catch (error) { await IOUtils.remove(copied, { ignoreAbsent: true }); throw error; }
      await zz.removeEmptyFolders(PathUtils.parent(source));
      return copied;
    };
    zz.getSourceDir = async (message = true) => {
      let path = zz.getPref("source_dir");
      if (zz.getPref("source_dir_ff")) {
        try { path = Services.dirsvc.get("DfltDwnld", Ci.nsIFile).path; }
        catch { path = PathUtils.join(OS.Constants.Path.homeDir, "Downloads"); }
      }
      if (path && await IOUtils.exists(path) && (await IOUtils.stat(path)).type === "directory") return path;
      if (message) zz.infoWindow("ZotFile", "Choose a source folder in ZotFile Settings.");
      return false;
    };
    zz.attachFile = async (parent, source) => {
      if (!parent?.isRegularItem()) throw new Error("Choose a parent reference before attaching a file.");
      if (!Zotero.Libraries.get(parent.libraryID).editable) throw new Error("This library is read-only.");
      const imported = zz.getPref("import") || parent.library.libraryType !== "user";
      let attachment, copied;
      zz.excludeAutorenameKeys.push(parent.key);
      try {
        if (imported) {
          attachment = await Zotero.Attachments.importFromFile({ file: source, parentItemID: parent.id, libraryID: parent.libraryID });
          attachment = await zz.renameAttachment(attachment, true);
        }
        else {
          const base = zz.getPref("dest_dir");
          if (!base || !PathUtils.isAbsolute(base)) throw new Error("Choose an absolute linked-file destination in Settings.");
          const location = zz.getLocation(base, parent, zz.getPref("subfolder") ? zz.getPref("subfolderFormat") : "");
          const desired = PathUtils.join(location, zz.getFilename(parent, PathUtils.filename(source)));
          const same = this.samePath(source, desired);
          const path = same ? source : (copied = await this.copyUnique(source, desired));
          attachment = await Zotero.Attachments.linkFromFile({ file: path, parentItemID: parent.id, libraryID: parent.libraryID });
          attachment.setField("title", attachment.attachmentFilename);
          await attachment.saveTx();
        }
      }
      catch (error) {
        if (attachment?.id) await attachment.eraseTx();
        if (copied) await IOUtils.remove(copied, { ignoreAbsent: true });
        throw error;
      }
      if (!this.samePath(source, await attachment.getFilePathAsync())) {
        try { await IOUtils.remove(source); }
        catch (error) { Zotero.logError(error); zz.messages_warning.push("The source file was retained: " + source); }
      }
      return attachment;
    };
    zz.removeFile = file => {
      const entry = Zotero.File.pathToFile(file);
      if (!entry.exists()) return;
      if (entry.isDirectory() && entry.directoryEntries.hasMoreElements()) return;
      entry.remove(false);
    };
    const originalFilename = zz.getFilename.bind(zz);
    zz.getFilename = (...args) => {
      const name = originalFilename(...args);
      return zz.getPref("removeDiacritics") ? Zotero.Utilities.removeDiacritics(name) : name;
    };
    zz.removeEmptyFolders = async folder => {
      let path = typeof folder === "string" ? folder : folder.path;
      const roots = [Zotero.getStorageDirectory().path, zz.getPref("source_dir"), zz.getPref("dest_dir"), zz.getPref("tablet.dest_dir")]
        .filter(Boolean).map(path => this.comparisonPath(path));
      path = OS.Path.normalize(path);
      while (roots.some(root => this.comparisonPath(path).startsWith(root + zz.folderSep)) && !roots.includes(this.comparisonPath(path))) {
        if (!await IOUtils.exists(path) || (await IOUtils.stat(path)).type !== "directory" || (await IOUtils.getChildren(path)).length) break;
        await IOUtils.remove(path);
        path = PathUtils.parent(path);
      }
    };
    zz.moveLinkedAttachmentFile = async (att, location, filename) => {
      const before = await att.getFilePathAsync();
      if (!before) throw new Error("Attachment file is missing.");
      const desired = PathUtils.join(location, Zotero.File.getValidFileName(filename));
      if (this.samePath(before, desired)) {
        if (PathUtils.filename(before) !== PathUtils.filename(desired)) {
          const result = await att.renameAttachmentFile(PathUtils.filename(desired));
          if (result === false || typeof result === "number" && result < 0) throw new Error("The attachment could not be renamed.");
        }
        return true;
      }
      const after = await this.copyUnique(before, desired);
      try { await att.relinkAttachmentFile(after); }
      catch (error) { await IOUtils.remove(after, { ignoreAbsent: true }); throw error; }
      await IOUtils.remove(before);
      await zz.removeEmptyFolders(PathUtils.parent(before));
      return true;
    };
    zz.renameAttachment = async (att, imported = zz.getPref("import"), rename = true,
      folder = zz.getPref("dest_dir"), subfolder, verbose = true) => {
      if (!att?.isAttachment() || !att.parentID) throw new Error("Choose a file attachment with a parent reference.");
      if (!att.isStoredFileAttachment() && !att.isLinkedFileAttachment()) return att;
      if (!Zotero.Libraries.get(att.libraryID).editable) throw new Error("This library is read-only.");
      const parent = Zotero.Items.get(att.parentID);
      const before = await att.getFilePathAsync();
      if (!before) throw new Error("Attachment file is missing.");
      const filename = rename ? zz.getFilename(parent, att.attachmentFilename) : att.attachmentFilename;
      imported = imported || parent.library.libraryType !== "user";
      let result = att;
      if (imported && att.isLinkedFileAttachment()) {
        result = await this.linkedToStored(att, parent, filename);
      }
      else if (imported) {
        const success = await att.renameAttachmentFile(filename);
        if (success === false || typeof success === "number" && success < 0) throw new Error("The attachment could not be renamed.");
        att.setField("title", att.attachmentFilename);
        await att.saveTx();
      }
      else {
        if (!folder || !PathUtils.isAbsolute(folder)) throw new Error("Choose an absolute destination folder in ZotFile Settings first.");
        const format = subfolder === undefined ? zz.getPref("subfolder") ? zz.getPref("subfolderFormat") : "" : subfolder;
        const location = zz.getLocation(folder, parent, format);
        if (att.isLinkedFileAttachment()) {
          await zz.moveLinkedAttachmentFile(att, location, filename);
          att.setField("title", att.attachmentFilename);
          await att.saveTx();
        }
        else result = await this.storedToLinked(att, parent, location, filename);
      }
      if (verbose) zz.messages_report.push((imported ? "Stored: " : "Linked: ") + result.attachmentFilename);
      return result;
    };
    zz.renameSelectedAttachments = async () => {
      const attachments = Zotero.Items.get(zz.getSelectedAttachments());
      if (zz.getPref("confirmation_batch_ask") && attachments.length >= zz.getPref("confirmation_batch") &&
        !Services.prompt.confirm(Zotero.getMainWindow(), "ZotFile", "Rename and move " + attachments.length + " attachments?")) return [];
      const progressWindow = zz.progressWindow(zz.ZFgetString("renaming.renamed"));
      const results = [];
      if (!attachments.length) progressWindow.addDescription("No file attachments selected. Select a reference with a file attachment or select its PDF directly.");
      for (const attachment of attachments) {
        const title = attachment.getField("title") || attachment.attachmentFilename || "Attachment";
        const progress = new progressWindow.ItemProgress("attachmentPDF", title);
        try {
          let reason;
          if (attachment.isTopLevelItem()) reason = "Add this attachment to a parent reference before renaming.";
          else if (attachment.attachmentContentType === "text/html") reason = "Web snapshot: kept unchanged.";
          else if (!zz.checkFileType(attachment)) reason = "This file type is excluded in ZotFile Settings.";
          else if (zz.Tablet.getTabletStatus(attachment)) reason = "Sent to tablet: use Get from tablet folder first.";
          else if (!await attachment.fileExists()) reason = "File is not available locally. Open this attachment in Zotero to locate or download it.";
          if (reason) {
            progress.setText(title + " — " + reason);
            progress.setError();
            results.push({ itemID: attachment.id, title, status: "skipped", reason });
            continue;
          }
          const renamed = await zz.renameAttachment(attachment);
          progress.complete(renamed.attachmentFilename);
          results.push({ itemID: renamed.id, title, status: "renamed", filename: renamed.attachmentFilename });
        }
        catch (error) {
          Zotero.logError(error);
          const reason = String(error.message || error);
          progress.setText(title + " — " + reason);
          progress.setError();
          results.push({ itemID: attachment.id, title, status: "failed", reason });
        }
      }
      progressWindow.startCloseTimer(zz.getPref("info_window_duration"));
      return results;
    };
  },

  async copyUnique(before, desired) {
    if (!PathUtils.isAbsolute(desired)) throw new Error("The destination must be an absolute file path.");
    await IOUtils.makeDirectory(PathUtils.parent(desired), { createAncestors: true, ignoreExisting: true });
    const dot = desired.lastIndexOf(".");
    const base = dot > desired.lastIndexOf(Zotero.ZotFile.folderSep) ? desired.slice(0, dot) : desired;
    const extension = desired.slice(base.length);
    for (let suffix = 1; suffix < 1000; suffix++) {
      const path = suffix === 1 ? desired : base + "-" + suffix + extension;
      if (await IOUtils.exists(path)) continue;
      try {
        await IOUtils.copy(before, path, { noOverwrite: true });
        await IOUtils.setModificationTime(path, (await IOUtils.stat(before)).lastModified);
        return path;
      }
      catch (error) {
        if (error.name === "NoModificationAllowedError" && await IOUtils.exists(path)) continue;
        throw error;
      }
    }
    throw new Error("Too many files with the same name in the destination folder.");
  },

  async rewriteNoteLinks(parent, beforeKey, afterKey, touched) {
    for (const id of parent.getNotes()) {
      const note = Zotero.Items.get(id);
      const before = note.getNote();
      const prefix = "(/items/|%2[fF]items%2[fF]|open-pdf/\\d+_|open-pdf%2[fF]\\d+_)";
      const after = before.replace(new RegExp(prefix + beforeKey + "(?=\\b|%)", "g"), "$1" + afterKey);
      if (before !== after) { touched?.add(note); note.setNote(after); await note.save(); }
    }
  },

  async moveAnnotations(before, after) {
    // Zotero's generic moveChildItems intentionally skips annotations embedded
    // in PDFs. Move both embedded and native annotations to preserve their keys.
    for (const annotation of before.getAnnotations(true)) {
      annotation.parentID = after.id;
      await annotation.save({ skipEditCheck: true });
    }
  },

  async copyIncomingRelations(before, after, touched) {
    const beforeURI = Zotero.URI.getItemURI(before);
    const afterURI = Zotero.URI.getItemURI(after);
    for (const { subject, predicate } of await Zotero.Relations.getByObject("item", beforeURI)) {
      if (!subject.isEditable()) continue;
      touched?.add(subject);
      subject.addRelation(predicate, afterURI);
      await subject.save({ skipDateModifiedUpdate: true });
    }
  },

  async linkedToStored(att, parent, filename) {
    const before = await att.getFilePathAsync();
    const touched = new Set([att, parent, ...att.getAnnotations(true)]);
    let replacement;
    Zotero.ZotFile.excludeAutorenameKeys.push(parent.key);
    try {
      replacement = await Zotero.Attachments.importFromFile({ file: before, parentItemID: parent.id, libraryID: att.libraryID });
      const metadata = att.toJSON();
      delete metadata.key; delete metadata.version; delete metadata.path;
      metadata.linkMode = "imported_file";
      metadata.filename = replacement.attachmentFilename;
      replacement.fromJSON(metadata);
      await replacement.renameAttachmentFile(filename);
      replacement.setField("title", replacement.attachmentFilename);
      await replacement.saveTx();
      await Zotero.DB.executeTransaction(async () => {
        await this.moveAnnotations(att, replacement);
        await this.copyIncomingRelations(att, replacement, touched);
        await this.rewriteNoteLinks(parent, att.key, replacement.key, touched);
        try { await Zotero.Fulltext.transferItemIndex(att, replacement); }
        catch (error) { Zotero.logError(error); }
        await att.erase();
      });
    }
    catch (error) {
      await this.cleanupFailedConversion(replacement, touched);
      throw error;
    }
    try { await IOUtils.remove(before); await Zotero.ZotFile.removeEmptyFolders(PathUtils.parent(before)); }
    catch (error) { Zotero.logError(error); Zotero.ZotFile.messages_warning.push("The original linked file was retained: " + before); }
    return replacement;
  },

  async storedToLinked(att, parent, location, filename) {
    if (await Zotero.Attachments.hasMultipleFiles(att)) {
      throw new Error("This attachment contains multiple files. Keep it stored in Zotero to preserve its supporting files.");
    }
    const before = await att.getFilePathAsync();
    const touched = new Set([att, parent, ...att.getAnnotations(true)]);
    const after = await this.copyUnique(before, PathUtils.join(location, filename));
    let replacement;
    try {
      replacement = await Zotero.Attachments.linkFromFile({ file: after, parentItemID: parent.id, libraryID: att.libraryID });
      const metadata = att.toJSON();
      delete metadata.key;
      delete metadata.version;
      delete metadata.filename;
      metadata.linkMode = "linked_file";
      metadata.path = after;
      replacement.fromJSON(metadata);
      replacement.setField("title", PathUtils.filename(after));
      replacement.setNote(att.getNote());
      replacement.setTags(att.getTags());
      replacement.setRelations(att.getRelations());
      await replacement.saveTx();
      await Zotero.DB.executeTransaction(async () => {
        await this.moveAnnotations(att, replacement);
        await this.copyIncomingRelations(att, replacement, touched);
        await this.rewriteNoteLinks(parent, att.key, replacement.key, touched);
        try { await Zotero.Fulltext.transferItemIndex(att, replacement); }
        catch (error) { Zotero.logError(error); }
        await att.erase();
      });
      return replacement;
    }
    catch (error) {
      await this.cleanupFailedConversion(replacement, touched);
      await IOUtils.remove(after, { ignoreAbsent: true });
      throw error;
    }
  },

  async cleanupFailedConversion(replacement, touched) {
    // A database rollback does not restore all parent/child caches. Reload
    // affected objects before erasing the unused replacement attachment.
    for (const item of touched) await item.reload(undefined, true);
    if (replacement?.id) {
      await replacement.reload(["primaryData", "childItems"], true);
      await replacement.eraseTx();
    }
  },

  patchPDF() {
    const zz = Zotero.ZotFile;
    zz.pdfAnnotations.getAnnotations = async ids => {
      const notes = [];
      for (const id of ids || zz.getSelectedAttachments()) {
        const att = Zotero.Items.get(id);
        if (!att?.parentID || att.attachmentContentType !== "application/pdf" || !await att.fileExists()) continue;
        await Zotero.PDFWorker.import(att.id, true);
        const annotations = att.getAnnotations();
        if (annotations.length) notes.push(await Zotero.EditorInstance.createNoteFromAnnotations(annotations, { parentID: att.parentID }));
      }
      if (!notes.length) zz.infoWindow("ZotFile", "No PDF annotations were found in the selected attachments.");
      return notes;
    };
    zz.pdfOutline.getOutline = async ids => {
      const results = [];
      for (const id of ids || zz.getSelectedAttachments()) {
        const att = Zotero.Items.get(id);
        if (!att?.parentID || att.attachmentContentType !== "application/pdf") continue;
        const path = await att.getFilePathAsync();
        if (!path) continue;
        const helper = await this.pdfHelper();
        const outline = await helper.readOutline(await IOUtils.read(path));
        if (!outline.length) continue;
        const doc = new DOMParser().parseFromString(att.getNote() || "", "text/html");
        doc.querySelector("#zotfile-toc")?.remove();
        const section = doc.createElement("div");
        section.id = "zotfile-toc";
        const title = doc.createElement("h2"); title.textContent = "Contents"; section.appendChild(title);
        const add = (entries, parent, depth) => {
          if (depth > zz.getPref("pdfOutline.tocDepth")) return;
          const list = doc.createElement("ul");
          for (const entry of entries) {
            const li = doc.createElement("li"), link = doc.createElement("a");
            link.textContent = entry.title;
            if (entry.page !== null) link.setAttribute("href", "zotero://open-pdf/library/items/" + att.key + "?page=" + entry.page);
            li.appendChild(link);
            if (entry.items?.length) add(entry.items, li, depth + 1);
            list.appendChild(li);
          }
          parent.appendChild(list);
        };
        add(outline, section, 1);
        doc.body.prepend(section);
        att.setNote(doc.body.innerHTML);
        await att.saveTx();
        results.push(att.id);
      }
      return results;
    };
  },

  async pdfHelper() {
    const win = Zotero.getMainWindow();
    let record = this.helpers.get(win);
    if (!record) {
      const { HiddenBrowser } = ChromeUtils.importESModule("chrome://zotero/content/HiddenBrowser.mjs");
      const browser = new HiddenBrowser({ allowJavaScript: true });
      record = { browser, ready: (async () => {
        if (!await browser.load("chrome://zotfile-modern/content/pdf-helper.xhtml")) throw new Error("The local PDF helper could not be loaded.");
        const page = browser._browser.contentWindow;
        for (let i = 0; i < 100 && !page.pdfHelperReady; i++) await ZotFileLegacyPromise.delay(50);
        if (!page.pdfHelperReady) throw new Error("The PDF helper script did not initialise.");
        await page.pdfHelperReady;
        return page;
      })() };
      this.helpers.set(win, record);
    }
    return record.ready;
  },

  async chooseDirectory() {
    const { FilePicker } = ChromeUtils.importESModule("chrome://zotero/content/modules/filePicker.mjs");
    const picker = new FilePicker();
    picker.init(Zotero.getMainWindow(), "Choose a ZotFile folder", picker.modeGetFolder);
    if (await picker.show() !== picker.returnOK) return "";
    return typeof picker.file === "string" ? picker.file : picker.file.path;
  },

  openSettings(tab) {
    if (this.settingsWindow && !this.settingsWindow.closed) { this.settingsWindow.focus(); return; }
    const zz = Zotero.ZotFile;
    const model = {
      schema: ZotFileSettingsData,
      get: name => zz.getPref(name),
      save: values => {
        for (const [name, value] of Object.entries(values)) zz.setPref(name, value);
        zz.Tablet.tag = zz.getPref("tablet.tag");
        zz.Tablet.tagMod = zz.getPref("tablet.tagModified");
      },
      choose: () => this.chooseDirectory(),
      preview: format => {
        let item = Zotero.getMainWindow().ZoteroPane.getSelectedItems()[0];
        if (item?.parentID) item = Zotero.Items.get(item.parentID);
        return item?.isRegularItem() ? zz.getFilename(item, "attachment.pdf", format) : "Select a reference in Zotero first.";
      },
      done: () => { this.settingsWindow = null; }, tab
    };
    this.settingsWindow = Zotero.getMainWindow().openDialog("chrome://zotfile-modern/content/settings.xhtml", "",
      "chrome,centerscreen,resizable,dialog=no,width=850,height=760", model);
  }
};
