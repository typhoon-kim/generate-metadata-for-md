import fs from 'fs/promises';
import { basename, dirname, extname, join } from 'path';
import CONSTANTS from './constants.js';

const noteList = [];
const linkList = [];
const tagList = [];

async function generateNoteMeta(file) {
    try {
        const stat = await fs.stat(file);
        if (stat.isDirectory()) {
            const files = await fs.readdir(file);
            await Promise.all(files.map(f => generateNoteMeta(join(file, f))));
        } else if (extname(file) === ".md") {
            console.log("md파일--");
            console.log(`filename: ${basename(file)}, dirname: ${dirname(file)}, stat: ${stat}`);
            noteList.push({
                id: "",
                title: basename(file),
                route: dirname(file),
                created: stat.ctime,
                updated: stat.mtime,
                tags: [], // 태그들
                links: [], // 들어오는 링크, 나가는 링크, 하이퍼링크
            });
        } else {
            console.log("attach파일--");
            console.log(file);
        }
    } catch (err) {
        console.log(`${file} >> ${err.code}`);
    }
}

async function generateNoteList(files) {
    await Promise.all(files.map(file => generateNoteMeta(file)));
    console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ${noteList.length} Done!`);
    console.log(noteList);
    await fs.writeFile(CONSTANTS.EXPORT_NOTE_LIST, JSON.stringify(noteList, null, 2), "utf8");
}

generateNoteList(CONSTANTS.PUBLISH_PATH);
