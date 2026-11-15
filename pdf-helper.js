/* Uses Zotero's maintained PDF.js instead of ZotFile's old bundled renderer. */
window.pdfHelperReady = (async () => {
  const pdfjs = await import("resource://zotero/reader/pdf/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = "resource://zotero/reader/pdf/build/pdf.worker.mjs";
  window.readOutline = async bytes => {
    const data = new Uint8Array(bytes.length);
    data.set(bytes);
    const task = pdfjs.getDocument({ data, isEvalSupported: false, disableFontFace: true });
    const pdf = await task.promise;
    try {
      const convert = async entries => {
        const result = [];
        for (const entry of entries || []) {
          let destination = typeof entry.dest === "string" ? await pdf.getDestination(entry.dest) : entry.dest;
          let page = null;
          if (destination?.length) {
            page = typeof destination[0] === "object"
              ? await pdf.getPageIndex(destination[0]) + 1 : destination[0] + 1;
          }
          result.push({ title: entry.title, page, items: await convert(entry.items) });
        }
        return result;
      };
      return await convert(await pdf.getOutline());
    }
    finally { await task.destroy(); }
  };
})();
