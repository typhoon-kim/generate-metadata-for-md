import fs from 'fs';
import { basename, dirname, extname, join } from 'path';
import CONSTANTS from './constants.js'

const noteList = [];
const linkList = [];
const tagList = [];

function generateNoteMeta(file) {
    return new Promise((resolve, reject) => {
        fs.stat(file, (err, stat) => {
            if (err) { console.log(`${file} >> ${err.code}`); resolve(); }
            else
                if (stat.isDirectory()) {
                    fs.readdir(file, async (err, files) => {
                        if (err) { console.log(`${file} >> ${err.code}`); resolve(); }
                        else {
                            const promises = files.map((f) => generateNoteMeta(join(file, f)));
                            await Promise.all(promises);
                            resolve();
                        }
                    });
                } else {
                    const ext = extname(file);
                    if (ext === ".md") {
                        console.log("md파일--");
                        console.log(`filename: ${basename(file)}, dirname: ${dirname(file)}, stat: ${stat}`);
                        noteList.push({
                            id: "",
                            title: basename(file),
                            route: dirname(file),
                            created: stat.ctime,
                            updated: stat.mtime,
                            tags: [], // 태그들
                            links: [], // 들어오는링크, 나가는링크, 하이퍼링크
                        });

                    } else {
                        console.log("attach파일--");
                        console.log(file);
                    }
                    resolve();
                }
        })
    });
}

async function generateNoteList(files) {
    const promises = files.map((file) => generateNoteMeta(file));
    await Promise.all(promises);
    console.log(`>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> ${promises.length} Done!`);
    console.log(noteList);
    fs.writeFileSync(CONSTANTS.EXPORT_NOTE_LIST, JSON.stringify(noteList), "utf8");
}

generateNoteList(CONSTANTS.PUBLISH_PATH);

// fs.writeFile(CONSTANTS.EXPORT_NOTE_LIST, JSON.stringify(noteList), "utf8", (err) => {
//     if (err) console.log(err);
// });

// fs.readFile(CONSTANTS.EXPORT_NOTE_LIST, "utf8", (err, data) => {
//     if (err) console.log(err);
//     console.log(data.toString());
// });

// fs.writeFileSync(CONSTANTS.EXPORT_NOTE_LIST, JSON.stringify(noteList), "utf8");