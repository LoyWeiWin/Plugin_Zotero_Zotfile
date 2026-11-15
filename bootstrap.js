/* ZotFile 5.1.2 compatibility layer, GPL-3.0-or-later. */
var zotfileScope;
var zotfileChrome;

function install() {}
function uninstall() {}

async function startup({ rootURI, version }) {
  const registrar = Cc["@mozilla.org/addons/addon-manager-startup;1"].getService(Ci.amIAddonManagerStartup);
  zotfileChrome = registrar.registerChrome(Services.io.newURI(rootURI + "manifest.json"), [
    ["content", "zotfile", "chrome/content/zotfile/"],
    ["content", "zotfile-modern", "./"],
    ...["en-US", "de-DE", "fr-FR", "it-IT"].map(locale => ["locale", "zotfile", locale, "chrome/locale/" + locale + "/"])
  ]);
  const { OS } = ChromeUtils.importESModule("chrome://zotero/content/osfile.mjs");
  zotfileScope = { Zotero, Services, OS, Components, ChromeUtils, IOUtils, PathUtils,
    Cc, Ci, Cu: Components.utils, TextDecoder, TextEncoder, DOMParser, setTimeout, clearTimeout };
  Object.defineProperties(zotfileScope, {
    window: { get: () => Zotero.getMainWindow() },
    document: { get: () => Zotero.getMainWindow()?.document },
    prompt: { value: (message, value) => {
      const result = { value: value || "" };
      return Services.prompt.prompt(Zotero.getMainWindow(), "ZotFile", message, result, null, {}) ? result.value : null;
    } },
    confirm: { value: message => Services.prompt.confirm(Zotero.getMainWindow(), "ZotFile", message) }
  });
  Services.scriptloader.loadSubScript(rootURI + "legacy-promise.js", zotfileScope);
  const legacyPromise = zotfileScope.ZotFileLegacyPromise;
  zotfileScope.Zotero = new Proxy(Zotero, {
    get: (target, key) => key === "Promise" ? legacyPromise : Reflect.get(target, key, target),
    set: (target, key, value) => Reflect.set(target, key, value, target)
  });
  for (const name of ["zotfile", "pdfAnnotations", "pdfOutline", "wildcards", "tablet", "utils", "notifier", "ui"]) {
    Services.scriptloader.loadSubScript(rootURI + "chrome/content/zotfile/" + name + ".js", zotfileScope);
  }
  Services.scriptloader.loadSubScript(rootURI + "modern.js", zotfileScope);
  Services.scriptloader.loadSubScript(rootURI + "settings-data.js", zotfileScope);
  await zotfileScope.ZotFileModern.start({ rootURI, version });
  const { AddonManager } = ChromeUtils.importESModule("resource://gre/modules/AddonManager.sys.mjs");
  const addon = await AddonManager.getAddonByID("zotfile@columbia.edu");
  if (addon) addon.applyBackgroundUpdates = AddonManager.AUTOUPDATE_DISABLE;
}

function onMainWindowLoad({ window }) { zotfileScope?.ZotFileModern?.addWindow(window); }
function onMainWindowUnload({ window }) { zotfileScope?.ZotFileModern?.removeWindow(window); }

async function shutdown() {
  if (zotfileScope?.ZotFileModern) await zotfileScope.ZotFileModern.stop();
  zotfileScope = null;
  zotfileChrome?.destruct();
  zotfileChrome = null;
}
