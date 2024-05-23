import fs from 'fs/promises';
import { existsSync } from 'fs';
import { basename, dirname, extname, join, normalize } from 'path/posix';
import { CONSTANTS as CONST } from './main.js';
import { createHash } from 'crypto';
import { marked } from 'marked';

const noteList = [];
let linkList = [];
let tagList = [];

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
    const filteredLinks = allLinks.filter(link => link && !images.includes(link.url)).filter(link => link && !link.alias.startsWith("!["));

    // 중복 제거-- Set을 사용하여 중복되지 않도록
    const uniqueTags = [...new Set(tags)];
    const uniqueLinks = [...new Set(filteredLinks.map(JSON.stringify))].map(JSON.parse);

    return { tags: uniqueTags, links: uniqueLinks, images };
}

function extractSummary(content) {
    // 마크다운을 HTML로 변환
    const htmlContent = marked(content);
    // HTML 태그 제거
    const plainText = htmlContent.replace(/<[^>]*>/g, '');
    // 첫 100자의 텍스트 추출
    return plainText.slice(0, 300).replace(/\n/g, ' ') + (plainText.length > 300 ? '...' : '');
}

function extractOutline(content) {
    const outline = [];
    const tokens = marked.lexer(content);

    tokens.forEach(token => {
        if (token.type == "heading") {
            const level = token.depth;
            const title = token.text;
            outline.push({ [level]: title });
        }
    });

    return outline;
}

async function generateNoteMeta(file, ROOT, withOutRoot) {
    try {
        const stat = await fs.stat(file);
        if (stat.isDirectory()) {
            const files = await fs.readdir(file);
            await Promise.all(files.map(f => generateNoteMeta(join(file, f), ROOT, withOutRoot)));
        } else if (extname(file) === ".md") {

            const content = await fs.readFile(file, "utf8");
            const { tags, links, images } = await extractTagsAndLinks(content);

            const path = normalize(dirname(file));
            //const hash = createHash('sha256').update(file + content).digest('hex'); // 파일 내용에 대한 SHA-256 해시 계산
            const hash = createHash('md5').update(file + content).digest('hex'); // 파일 내용에 대한 MD5 해시 계산

            const outline = extractOutline(content);

            const summary = extractSummary(content);

            noteList.push({
                id: hash,
                title: basename(file),
                route: withOutRoot ? path.substring(normalize(ROOT).length) : path,
                created: stat.ctime,
                updated: stat.mtime,
                outline: outline,
                tags: tags, // 태그들
                links: links.filter((link) => link.type === 'hyperlink'), // 들어오는 링크, 나가는 링크, 하이퍼링크
                summary: summary,
                images: images
            });

            tagList = tagList.concat(tags);
            linkList = linkList.concat(links.filter(link => link.type === 'obsidian').map((link) => ({from: hash, ...link })));

        } else {
            console.log(`Skipping non-markdown file: ${file}`);
        }
    } catch (err) {
        console.error(`Error processing file ${file}: ${err.message}`);
    }
}

export async function generateNoteList(files, withOutRoot) {
    if (typeof files == "string" ) files = new Array(files);

    await Promise.all(files.map(file => generateNoteMeta(file, file, withOutRoot)));
    console.log(`${noteList.length} notes processed!`);
    if (!existsSync(CONST.EXPORT_ROOT)) await fs.mkdir(CONST.EXPORT_ROOT);

    await fs.writeFile(join(CONST.EXPORT_ROOT, CONST.NOTE_LIST), JSON.stringify(noteList, null, 2), "utf8");
    await fs.writeFile(join(CONST.EXPORT_ROOT, CONST.TAG_LIST), JSON.stringify([...new Set(tagList)], null, 2), "utf8");
    await fs.writeFile(join(CONST.EXPORT_ROOT, CONST.LINK_LIST), JSON.stringify(linkList, null, 2), "utf8");
}
