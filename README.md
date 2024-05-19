# **Generate Metadata of Markdown**

English | [한국어](https://typhoon-kim.github.io/generate-metadata-of-markdown/README_ko.html)

[![npm version](https://badge.fury.io/js/@typh007%2Fmarkdown-metadata.svg)](https://badge.fury.io/js/@typh007%2Fmarkdown-metadata)

This package traverses the directory and generates metadata `JSON`file of `markdown` files.

It was created for the purpose of applying it to personal projects. [publish-markdown-notebook](https://github.com/typhoon-kim/publish-markdown-notes)  
I'm going to consider scalability going forward. Please let me know if you have any opinions. 😉

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

`publishPath` can be a `string array` type or `string` type.

```javascript
const publishPath = [
    "path1",
    "path2"
];

const publishPaht = "path";
```

## Output

Calling the `generateNoteList` function creates files `link_list.json`, `note_list.json` and `tag_list.json` in `./data` path.

To modify the file creation path, set the path to the `setDataRoot` function.

```javascript
import { generateNoteList, setDataRoot } from "@typh007/markdown-metadata";

setDataRoot("export path");
generateNoteList("target path");
```

`note_list.json`contains note-specific information.

- id: MD5 hash informatin for notes
- title: name of note (file name)
- route: path of note (file path)
- created: datetime of creation of the note
- updated: datetime of revision of the note
- tags: tags in note
- links: hyperlinks in note

`link_list.json`has an `Obsidian Backlink` entry for all notes.

- from: MD5 hash informatin for notes.
- type: "obsidian"
- alias: note alias
- url: path of note

`tag_list.json` has a list of markdown tags for all files.

## 🔭 Future Features

- [ ] **Compares hash checksums to reflect only information in notes that have been added and changed**
- [ ] **Example creation**
- [ ] **Create a script**
- [ ] **CommonJS, TypeScript d.ts**

## 🤝 Contributing

Contributions are welcome!

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---
*If you have any further questions or need additional assistance, feel free to ask!*