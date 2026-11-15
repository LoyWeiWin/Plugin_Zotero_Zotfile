var ZotFileSettingsData = [
  {
    "name": "debug",
    "type": "boolean",
    "default": false
  },
  {
    "name": "source_dir_ff",
    "type": "boolean",
    "default": true
  },
  {
    "name": "source_dir",
    "type": "string",
    "default": ""
  },
  {
    "name": "dest_dir",
    "type": "string",
    "default": ""
  },
  {
    "name": "filetypes",
    "type": "string",
    "default": "pdf,doc,docx,txt,rtf,djvu,epub"
  },
  {
    "name": "useFileTypes",
    "type": "boolean",
    "default": true
  },
  {
    "name": "allFiles",
    "type": "boolean",
    "default": false
  },
  {
    "name": "useZoteroToRename",
    "type": "boolean",
    "default": false
  },
  {
    "name": "renameFormat",
    "type": "string",
    "default": "{%a_}{%y_}{%t}"
  },
  {
    "name": "renameFormat_patent",
    "type": "string",
    "default": "{%a_}{%y_}{%t}"
  },
  {
    "name": "truncate_title",
    "type": "boolean",
    "default": true
  },
  {
    "name": "truncate_smart",
    "type": "boolean",
    "default": true
  },
  {
    "name": "truncate_title_max",
    "type": "boolean",
    "default": true
  },
  {
    "name": "max_titlelength",
    "type": "number",
    "default": 80
  },
  {
    "name": "truncate_authors",
    "type": "boolean",
    "default": true
  },
  {
    "name": "max_authors",
    "type": "number",
    "default": 2
  },
  {
    "name": "number_truncate_authors",
    "type": "number",
    "default": 1
  },
  {
    "name": "add_etal",
    "type": "boolean",
    "default": true
  },
  {
    "name": "etal",
    "type": "string",
    "default": " et al"
  },
  {
    "name": "authors_delimiter",
    "type": "string",
    "default": "_"
  },
  {
    "name": "removeDiacritics",
    "type": "boolean",
    "default": false
  },
  {
    "name": "removePeriods",
    "type": "boolean",
    "default": false
  },
  {
    "name": "confirmation",
    "type": "boolean",
    "default": true
  },
  {
    "name": "confirmation_batch_ask",
    "type": "boolean",
    "default": true
  },
  {
    "name": "confirmation_batch",
    "type": "number",
    "default": 2
  },
  {
    "name": "import",
    "type": "boolean",
    "default": true
  },
  {
    "name": "watch_folder",
    "type": "boolean",
    "default": true
  },
  {
    "name": "automatic_renaming",
    "type": "number",
    "default": 3
  },
  {
    "name": "disable_renaming",
    "type": "boolean",
    "default": false
  },
  {
    "name": "replace_blanks",
    "type": "boolean",
    "default": false
  },
  {
    "name": "lower_case",
    "type": "boolean",
    "default": false
  },
  {
    "name": "subfolder",
    "type": "boolean",
    "default": false
  },
  {
    "name": "subfolderFormat",
    "type": "string",
    "default": "/%w/%y"
  },
  {
    "name": "userInput",
    "type": "boolean",
    "default": false
  },
  {
    "name": "userInput_Default",
    "type": "string",
    "default": "Paper"
  },
  {
    "name": "version",
    "type": "string",
    "default": ""
  },
  {
    "name": "zotfile3update",
    "type": "boolean",
    "default": false
  },
  {
    "name": "info_window_duration_clickable",
    "type": "number",
    "default": 8000
  },
  {
    "name": "info_window_duration",
    "type": "number",
    "default": 6000
  },
  {
    "name": "wildcards.default",
    "type": "string",
    "default": "{\"a\": \"author\", \"A\": {\"field\": \"author\", \"operations\":[{\"function\":\"exec\",\"regex\": \"\\\\w{1}\"},{\"function\":\"toUpperCase\"}]}, \"F\": \"authorLastF\", \"I\": \"authorInitials\", \"d\": \"editor\", \"D\": {\"field\": \"editor\", \"operations\":[{\"function\":\"exec\",\"regex\": \"\\\\w{1}\"},{\"function\":\"toUpperCase\"}]}, \"L\": \"editorLastF\", \"l\": \"editorInitials\", \"t\": \"titleFormated\", \"h\": \"shortTitle\", \"j\": \"publicationTitle\", \"s\": \"journalAbbreviation\", \"p\": \"publisher\", \"w\": {\"default\": \"publisher\", \"audioRecording\": \"label\", \"bill\": \"legislativeBody\", \"case\": \"court\", \"computerProgram\": \"company\", \"film\": \"distributor\", \"journalArticle\": \"publicationTitle\", \"magazineArticle\": \"publicationTitle\", \"newspaperArticle\": \"publicationTitle\", \"patent\": \"issuingAuthority\", \"presentation\": \"meetingName\", \"radioBroadcast\": \"network\", \"report\": \"institution\", \"thesis\": \"university\", \"tvBroadcast\": \"network\"}, \"n\": \"patentNumber\", \"i\": \"assignee\", \"y\": \"year\", \"v\": \"volume\", \"e\": \"issue\", \"T\": \"itemType\", \"f\": \"pages\", \"x\": \"extra\", \"c\": \"collectionPaths\", \"g\": \"authorLastG\", \"q\":\"lastAuthor\", \"Q\":\"lastAuthor_lastInitial\", \"u\":\"lastAuthor_lastf\", \"U\":\"lastAuthor_initials\", \"b\":\"citekey\"}"
  },
  {
    "name": "wildcards.user",
    "type": "string",
    "default": "{}"
  },
  {
    "name": "tablet",
    "type": "boolean",
    "default": false
  },
  {
    "name": "tablet.dest_dir",
    "type": "string",
    "default": ""
  },
  {
    "name": "tablet.rename",
    "type": "boolean",
    "default": true
  },
  {
    "name": "tablet.updateAlwaysShow",
    "type": "boolean",
    "default": false
  },
  {
    "name": "tablet.updateExtractAnnotations",
    "type": "boolean",
    "default": false
  },
  {
    "name": "tablet.dest_dir_relativePath",
    "type": "boolean",
    "default": true
  },
  {
    "name": "tablet.tag",
    "type": "string",
    "default": "_tablet"
  },
  {
    "name": "tablet.tagModified",
    "type": "string",
    "default": "_tablet_modified"
  },
  {
    "name": "tablet.tagParentPush",
    "type": "boolean",
    "default": false
  },
  {
    "name": "tablet.tagParentPush_tag",
    "type": "string",
    "default": "_tablet_parent"
  },
  {
    "name": "tablet.tagParentPull",
    "type": "boolean",
    "default": false
  },
  {
    "name": "tablet.tagParentPull_tag",
    "type": "string",
    "default": "_ANNOTATED"
  },
  {
    "name": "tablet.confirmRepush",
    "type": "boolean",
    "default": true
  },
  {
    "name": "tablet.storeCopyOfFile",
    "type": "boolean",
    "default": false
  },
  {
    "name": "tablet.storeCopyOfFile_suffix",
    "type": "string",
    "default": "_annotated"
  },
  {
    "name": "tablet.subfolders",
    "type": "string",
    "default": "[]"
  },
  {
    "name": "tablet.projectFolders",
    "type": "number",
    "default": 0
  },
  {
    "name": "tablet.showwarning",
    "type": "boolean",
    "default": true
  },
  {
    "name": "tablet.projectFolders01",
    "type": "boolean",
    "default": false
  },
  {
    "name": "tablet.projectFolders01_folder",
    "type": "string",
    "default": ""
  },
  {
    "name": "tablet.projectFolders01_label",
    "type": "string",
    "default": "Project 01"
  },
  {
    "name": "tablet.projectFolders02",
    "type": "boolean",
    "default": false
  },
  {
    "name": "tablet.projectFolders02_folder",
    "type": "string",
    "default": ""
  },
  {
    "name": "tablet.projectFolders02_label",
    "type": "string",
    "default": "Project 02"
  },
  {
    "name": "tablet.projectFolders03",
    "type": "boolean",
    "default": false
  },
  {
    "name": "tablet.projectFolders03_folder",
    "type": "string",
    "default": ""
  },
  {
    "name": "tablet.projectFolders03_label",
    "type": "string",
    "default": "Project 03"
  },
  {
    "name": "tablet.projectFolders04",
    "type": "boolean",
    "default": false
  },
  {
    "name": "tablet.projectFolders04_folder",
    "type": "string",
    "default": ""
  },
  {
    "name": "tablet.projectFolders04_label",
    "type": "string",
    "default": "Project 04"
  },
  {
    "name": "tablet.projectFolders05",
    "type": "boolean",
    "default": false
  },
  {
    "name": "tablet.projectFolders05_folder",
    "type": "string",
    "default": ""
  },
  {
    "name": "tablet.projectFolders05_label",
    "type": "string",
    "default": "Project 05"
  },
  {
    "name": "tablet.projectFolders06",
    "type": "boolean",
    "default": false
  },
  {
    "name": "tablet.projectFolders06_folder",
    "type": "string",
    "default": ""
  },
  {
    "name": "tablet.projectFolders06_label",
    "type": "string",
    "default": "Project 06"
  },
  {
    "name": "tablet.projectFolders07",
    "type": "boolean",
    "default": false
  },
  {
    "name": "tablet.projectFolders07_folder",
    "type": "string",
    "default": ""
  },
  {
    "name": "tablet.projectFolders07_label",
    "type": "string",
    "default": "Project 07"
  },
  {
    "name": "tablet.projectFolders08",
    "type": "boolean",
    "default": false
  },
  {
    "name": "tablet.projectFolders08_folder",
    "type": "string",
    "default": ""
  },
  {
    "name": "tablet.projectFolders08_label",
    "type": "string",
    "default": "Project 08"
  },
  {
    "name": "tablet.projectFolders09",
    "type": "boolean",
    "default": false
  },
  {
    "name": "tablet.projectFolders09_folder",
    "type": "string",
    "default": ""
  },
  {
    "name": "tablet.projectFolders09_label",
    "type": "string",
    "default": "Project 09"
  },
  {
    "name": "tablet.projectFolders10",
    "type": "boolean",
    "default": false
  },
  {
    "name": "tablet.projectFolders10_folder",
    "type": "string",
    "default": ""
  },
  {
    "name": "tablet.projectFolders10_label",
    "type": "string",
    "default": "Project 10"
  },
  {
    "name": "tablet.projectFolders11",
    "type": "boolean",
    "default": false
  },
  {
    "name": "tablet.projectFolders11_folder",
    "type": "string",
    "default": ""
  },
  {
    "name": "tablet.projectFolders11_label",
    "type": "string",
    "default": "Project 11"
  },
  {
    "name": "tablet.projectFolders12",
    "type": "boolean",
    "default": false
  },
  {
    "name": "tablet.projectFolders12_folder",
    "type": "string",
    "default": ""
  },
  {
    "name": "tablet.projectFolders12_label",
    "type": "string",
    "default": "Project 12"
  },
  {
    "name": "tablet.projectFolders13",
    "type": "boolean",
    "default": false
  },
  {
    "name": "tablet.projectFolders13_folder",
    "type": "string",
    "default": ""
  },
  {
    "name": "tablet.projectFolders13_label",
    "type": "string",
    "default": "Project 13"
  },
  {
    "name": "tablet.projectFolders14",
    "type": "boolean",
    "default": false
  },
  {
    "name": "tablet.projectFolders14_folder",
    "type": "string",
    "default": ""
  },
  {
    "name": "tablet.projectFolders14_label",
    "type": "string",
    "default": "Project 14"
  },
  {
    "name": "tablet.projectFolders15",
    "type": "boolean",
    "default": false
  },
  {
    "name": "tablet.projectFolders15_folder",
    "type": "string",
    "default": ""
  },
  {
    "name": "tablet.projectFolders15_label",
    "type": "string",
    "default": "Project 15"
  },
  {
    "name": "tablet.subfolder",
    "type": "boolean",
    "default": false
  },
  {
    "name": "tablet.subfolderFormat",
    "type": "string",
    "default": "/%w/%y"
  },
  {
    "name": "tablet.mode",
    "type": "number",
    "default": 1
  },
  {
    "name": "pdfOutline.tocDepth",
    "type": "number",
    "default": 4
  },
  {
    "name": "pdfOutline.getToc",
    "type": "boolean",
    "default": true
  },
  {
    "name": "pdfOutline.menuItem",
    "type": "boolean",
    "default": true
  },
  {
    "name": "pdfExtraction.UsePDFJS",
    "type": "boolean",
    "default": true
  },
  {
    "name": "pdfExtraction.debug",
    "type": "boolean",
    "default": false
  },
  {
    "name": "pdfExtraction.UsePDFJSandPoppler",
    "type": "boolean",
    "default": false
  },
  {
    "name": "pdfExtraction.popplerDeleteTxtFile",
    "type": "boolean",
    "default": true
  },
  {
    "name": "pdfExtraction.Pull",
    "type": "boolean",
    "default": true
  },
  {
    "name": "pdfExtraction.MenuItem",
    "type": "boolean",
    "default": true
  },
  {
    "name": "pdfExtraction.NoteTruePage",
    "type": "boolean",
    "default": true
  },
  {
    "name": "pdfExtraction.NoteFullCite",
    "type": "boolean",
    "default": true
  },
  {
    "name": "pdfExtraction.NoteRemoveHyphens",
    "type": "boolean",
    "default": true
  },
  {
    "name": "pdfExtraction.formatNoteTitle",
    "type": "string",
    "default": "<p><b>%(title) (%(date))</b></p>"
  },
  {
    "name": "pdfExtraction.formatNoteTitleColor",
    "type": "string",
    "default": "<p><b>%(color) Annotations (%(date))</b></p>"
  },
  {
    "name": "pdfExtraction.formatAnnotationNote",
    "type": "string",
    "default": "<p><i>%(content) (<a href=\"%(uri)\">note on p.%(page)</a>)</i></p><br>"
  },
  {
    "name": "pdfExtraction.formatAnnotationHighlight",
    "type": "string",
    "default": "<p>\"%(content)\" (%(cite))</p>"
  },
  {
    "name": "pdfExtraction.formatAnnotationUnderline",
    "type": "string",
    "default": "<p>\"<u>%(content)</u>\" (%(cite))</p>"
  },
  {
    "name": "pdfExtraction.replacements",
    "type": "string",
    "default": "[]"
  },
  {
    "name": "pdfExtraction.isoDate",
    "type": "boolean",
    "default": false
  },
  {
    "name": "pdfExtraction.localeDateInNote",
    "type": "boolean",
    "default": true
  },
  {
    "name": "pdfExtraction.colorNotes",
    "type": "boolean",
    "default": false
  },
  {
    "name": "pdfExtraction.colorAnnotations",
    "type": "boolean",
    "default": false
  },
  {
    "name": "pdfExtraction.colorCategories",
    "type": "string",
    "default": "{\"Black\": \"#000000\", \"White\": \"#FFFFFF\", \"Gray\": \"#808080\", \"Red\": \"#FF0000\", \"Orange\": \"#FFA500\", \"Yellow\": \"#FFFF00\", \"Green\": \"#00FF00\", \"Cyan\": \"#00FFFF\", \"Blue\": \"#0000FF\", \"Magenta\": \"#FF00FF\"}"
  }
];
