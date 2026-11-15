"use strict";
window.addEventListener("DOMContentLoaded", () => {
  const model = window.arguments[0], controls = new Map();
  const core = {
    source_dir_ff: ["Use default Downloads folder", "folders"], source_dir: ["Source folder", "folders", "folder"],
    import: ["Keep files in Zotero storage", "folders"], dest_dir: ["Linked attachment folder", "folders", "folder"],
    subfolder: ["Use attachment subfolders", "folders"], subfolderFormat: ["Subfolder format", "folders"],
    allFiles: ["Attach all files in source folder", "folders"],
    renameFormat: ["Filename format", "naming"], renameFormat_patent: ["Patent filename format", "naming"],
    automatic_renaming: ["Automatic attachment handling", "naming", [[1,"Disabled"],[2,"Always ask"],[3,"Automatic for a single attachment"],[4,"Always automatic"]]],
    useZoteroToRename: ["Use Zotero's filename rules", "naming"], disable_renaming: ["Disable renaming", "naming"],
    replace_blanks: ["Replace spaces with underscores", "naming"], lower_case: ["Use lowercase filenames", "naming"],
    removeDiacritics: ["Remove accents from filenames", "naming"], max_titlelength: ["Maximum title length", "naming"],
    truncate_title_max: ["Limit title length", "naming"], truncate_authors: ["Limit author count", "naming"],
    max_authors: ["Maximum author count", "naming"], number_truncate_authors: ["Authors retained when shortened", "naming"],
    authors_delimiter: ["Author separator", "naming"], add_etal: ["Append et al. for shortened authors", "naming"],
    filetypes: ["Allowed file extensions", "naming"], useFileTypes: ["Filter by file extension", "naming"],
    tablet: ["Enable tablet folder", "tablet"], "tablet.dest_dir": ["Tablet folder", "tablet", "folder"],
    "tablet.mode": ["Tablet file handling", "tablet", [[1,"Copy file to tablet folder"],[2,"Move and link file in tablet folder"]]],
    "tablet.rename": ["Rename files sent to tablet", "tablet"], "tablet.subfolder": ["Use tablet subfolder format", "tablet"],
    "tablet.subfolderFormat": ["Tablet subfolder format", "tablet"],
    "tablet.projectFolders": ["Tablet project folders", "tablet", [[0,"Disabled"],[1,"Use reference collections"],[2,"Use custom folders below"]]],
    "tablet.subfolders": ["Custom project folders (JSON)", "tablet", "json"],
    "tablet.storeCopyOfFile": ["Keep modified tablet file as another attachment", "tablet"],
    "tablet.storeCopyOfFile_suffix": ["Modified copy suffix", "tablet"],
    "pdfOutline.getToc": ["Read PDF contents on import", "pdf"], "pdfOutline.tocDepth": ["Table of contents depth", "pdf"],
    "pdfExtraction.Pull": ["Extract annotations after tablet return", "pdf"],
    confirmation: ["Confirm attaching source files", "confirmation"],
    confirmation_batch_ask: ["Confirm batch operations", "confirmation"], confirmation_batch: ["Batch confirmation threshold", "confirmation"]
  };
  const titles = { folders:"Files and folders", naming:"Filename rules", tablet:"Tablet workflow", pdf:"PDF contents and annotations", confirmation:"Confirmations", advanced:"Advanced settings" };
  const groups = new Map();
  for (const [key, title] of Object.entries(titles)) {
    const group = document.createElement(key === "advanced" ? "details" : "fieldset");
    const legend = document.createElement(key === "advanced" ? "summary" : "legend");
    legend.textContent = title; group.appendChild(legend);
    group.id = "group-" + key;
    document.getElementById("groups").appendChild(group); groups.set(key, group);
  }
  function help(group, text) { const p = document.createElement("p"); p.className="help"; p.textContent=text; groups.get(group).appendChild(p); }
  help("folders", "Stored attachments stay in Zotero storage. Turn this off and choose a linked attachment folder to move files outside Zotero storage. Linked files are supported in personal libraries.");
  help("naming", "Wildcards include %a for authors, %y for year, %t for title and %j for publication. Optional parts use braces, for example {%a_}{%y_}{%t}.");
  help("tablet", "The tablet folder can be a folder synced by Dropbox or another service. Custom folders use a JSON array such as [{\"label\":\"Project A\",\"path\":\"Project A\"}].");
  help("pdf", "Annotation extraction uses Zotero's current PDF engine and native annotation-note format. Old Poppler and legacy PDF.js formatting options are retained as preferences for reference, but are not used by this port.");
  for (const entry of model.schema) {
    if (entry.name === "version" || entry.name === "debug") continue;
    const info = core[entry.name] || [entry.name, "advanced"];
    const row=document.createElement("div"); row.className="row";
    const label=document.createElement("label"); label.textContent=info[0];
    let input;
    if (Array.isArray(info[2])) {
      input=document.createElement("select");
      for (const [value,text] of info[2]) { const option=document.createElement("option"); option.value=String(value); option.textContent=text; input.appendChild(option); }
    }
    else if (info[2]==="json" || entry.name.startsWith("wildcards.") || entry.name.startsWith("pdfExtraction.format")) input=document.createElement("textarea");
    else { input=document.createElement("input"); input.type=entry.type==="boolean"?"checkbox":entry.type==="number"?"number":"text"; }
    input.id="pref-"+entry.name; label.htmlFor=input.id;
    const value=model.get(entry.name);
    if (entry.type==="boolean") input.checked=!!value; else input.value=String(value??entry.default);
    row.append(label,input); groups.get(info[1]).appendChild(row); controls.set(entry.name,{input,entry});
    if (info[2]==="folder") {
      const button=document.createElement("button"); button.type="button"; button.textContent="Choose…";
      button.addEventListener("click",async()=>{ const path=await model.choose(); if(path){input.value=path;if(entry.name==="source_dir")controls.get("source_dir_ff").input.checked=false;} });
      row.appendChild(button);
    }
  }
  document.getElementById("cancel").addEventListener("click",()=>window.close());
  document.getElementById("preview").addEventListener("click",()=>{
    try { document.getElementById("filename").textContent=model.preview(controls.get("renameFormat").input.value); }
    catch(error){document.getElementById("message").textContent=error.message||String(error);}
  });
  document.getElementById("save").addEventListener("click",()=>{
    try {
      const values={};
      for(const [name,{input,entry}] of controls){
        const value=entry.type==="boolean"?input.checked:entry.type==="number"?Number(input.value):input.value;
        if(entry.type==="number"&&!Number.isInteger(value))throw new Error("Enter a whole number for "+name);
        if(name==="tablet.subfolders"){
          const folders=JSON.parse(value);
          if(!Array.isArray(folders)||folders.length>15||folders.some(f=>typeof f.label!=="string"||typeof f.path!=="string"))throw new Error("Custom folders must be an array of at most 15 objects with label and path strings.");
        }
        if(name.startsWith("wildcards."))JSON.parse(value);
        values[name]=value;
      }
      model.save(values);document.getElementById("message").textContent="Settings saved.";
    }
    catch(error){document.getElementById("message").textContent=error.message||String(error);}
  });
  window.addEventListener("unload",()=>model.done());
  if(model.tab)document.getElementById("group-"+model.tab)?.scrollIntoView();
});
