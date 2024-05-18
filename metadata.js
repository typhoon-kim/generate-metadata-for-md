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

    // 하이퍼링크 및 옵시디언 링크 추출 및 구분
    const linkPattern = /(?<!!)\[([^\]]+)\]\(([^)"]+)(?:\s+"[^"]*")?\)|\[\[([^\]|]+)\|?([^\]]+)?\]\]/g;
    const imageSrcPattern = /<img[^>]+src=["'](http[^"']+)["']/g;
    const referenceLinkPattern = /\[(\d+)\]:\s*(http[^\s]+)\s*"([^"]*)"/g;

    const links = [...content.matchAll(linkPattern)].map(match => {
        if (match[2] && !match[2].startsWith('#')) {
            return { type: 'hyperlink', alias: match[1], url: match[2] };
        } else if (match[3]) {
            return { type: 'obsidian', alias: match[4] || match[3], url: match[3] };
        }
    });

    // 이미지 태그의 src 속성을 포함한 링크 제거
    const images = [...content.matchAll(imageSrcPattern)].map(match => match[1]);

    // 레퍼런스 링크 추출
    const referenceLinks = [...content.matchAll(referenceLinkPattern)].map(match => {
        return { type: 'hyperlink', alias: match[3], url: match[2] };
    });

    // 모든 링크 합치기
    const allLinks = links.concat(referenceLinks);

    // 이미지 링크와 내부 하이퍼링크를 제외한 링크만 남기기
    const filteredLinks = allLinks.filter(link => link && !images.includes(link.url));

    // 중복 제거-- Set을 사용하여 중복되지 않도록
    const uniqueTags = [...new Set(tags)];
    const uniqueLinks = [...new Set(filteredLinks.map(JSON.stringify))].map(JSON.parse);

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
