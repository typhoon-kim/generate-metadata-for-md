export { generateNoteList } from './metadata.js';
export let CONSTANTS = {
    PUBLISH_PATH: [
        "./publish",
        "./example",
    ],
    EXPORT_ROOT: "./data",
    NOTE_LIST: "note_list.json",
    LINK_LIST: "link_list.json",
    TAG_LIST: "tag_list.json",
}

export function setPublishPath(path) {
    CONSTANTS.PUBLISH_PATH = path;
}

export function setDataRoot(path) {
    CONSTANTS.EXPORT_ROOT = path;
}