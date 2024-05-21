# **Generate Metadata of Markdown**

English | [한국어](https://typhoon-kim.github.io/generate-metadata-of-markdown/README_ko.html)

[![npm version](https://badge.fury.io/js/@typh007%2Fmarkdown-metadata.svg)](https://badge.fury.io/js/@typh007%2Fmarkdown-metadata)

This package traverses directories and generates metadata `JSON` files for `markdown` files.

This package was created for use in personal projects. [publish-markdown-notebook](https://github.com/typhoon-kim/publish-markdown-notes)
It is planned to be expanded for more versatile use. If you have any suggestions, please let me know. 😉

## Installation

```bash
npm i @typh007/markdown-metadata
```

## Usage

```javascript
import { generateNoteList } from "@typh007/markdown-metadata";

// Example usage
const publishPath = "your markdown files path";
generateNoteList(publishPath);
```

`publishPath` can be either a `string array` or a `string`.

```javascript
const publishPath = [
    "path1",
    "path2"
];

const publishPaht = "path";
```

You can specify the second argument `withOutRoot` in `generateNoteList` to exclude the root path from the file paths in `note_list`.

```javascript
import { generateNoteList } from "@typh007/markdown-metadata";

// Example usage
const publishPath = "your markdown files path";
generateNoteList(publishPath, withOutRoot); // true or false -- default: false
```

## Output

When the `generateNoteList` function is called, it generates the `note_list.json`, `link_list.json`, and `tag_list.json` files in the `./data` path by default.  
To change the output path, set the path using the `setDataRoot` function.

```javascript
import { generateNoteList, setDataRoot } from "@typh007/markdown-metadata";

setDataRoot("export path");
generateNoteList("target path");
```

`note_list.json` contains information for each note, including the following fields:

- id: MD5 hash of the note
- title: Name of the note (file name)
- route: Path of the note (file path)
- created: Creation date and time of the note
- updated: Last modified date and time of the note
- tags: List of tags included in the note
- links: Hyperlinks included in the note

`link_list.json` contains Obsidian backlink entries for all notes, including the following fields:

- from: MD5 hash of the note
- type: ‘obsidian’
- alias: Note alias
- url: Path of the note

`tag_list.json` contains the list of markdown tags for all files.

## 🔭 Future Features

- [ ] **Compare hash checksums to reflect only added or changed note information**
- [ ] **Create examples**
- [ ] **Create scripts**
- [ ] **Support CommonJS module, TypeScript d.ts**

## 🤝 Contributing

Contributions are welcome!

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---
*If you have any further questions or need support, please feel free to contact me!*