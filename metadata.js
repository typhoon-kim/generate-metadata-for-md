import fs from 'fs/promises';
import { basename, dirname, extname, join } from 'path';
import CONSTANTS from './constants.js';

const noteList = [];
const linkList = [];
const tagList = [];

async function extractTagsAndLinks(content) {
    // 태그 추출: '#' 다음에 공백이나 문자열 경계가 와야 함
    const tagPattern = /(^|\s)#(\w+)\b/g;
    const tags = [...content.matchAll(tagPattern)].map(match => match[2]);

    // 하이퍼링크 추출: 일반 하이퍼링크와 옵시디언 링크 둘 다 처리
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)|\[\[([^\]]+)\]\]/g;
    const links = [...content.matchAll(linkPattern)].map(match => match[2] || match[3]);

    // 중복 제거 - Set은 고유한 값만 저장하기 때문에 중목된 내용을 제거할 수 있다.
    const uniqueTags = [...new Set(tags)];
    const uniqueLinks = [...new Set(links)];

    return { tags: uniqueTags, links: uniqueLinks };
}

async function generateNoteMeta(file) {
    try {
        const stat = await fs.stat(file);
        if (stat.isDirectory()) {
            const files = await fs.readdir(file);
            await Promise.all(files.map(f => generateNoteMeta(join(file, f))));
        } else if (extname(file) === ".md") {
            console.log("md파일--");
            console.log(`filename: ${basename(file)}, dirname: ${dirname(file)}, stat: ${stat}`);

            const content = await fs.readFile(file, "utf8");
            const {tags, links} = await extractTagsAndLinks(content);

            noteList.push({
                id: "",
                title: basename(file),
                route: dirname(file),
                created: stat.ctime,
                updated: stat.mtime,
                tags: tags, // 태그들
                links: links, // 들어오는 링크, 나가는 링크, 하이퍼링크
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
