import fs from 'fs/promises';
import { existsSync } from 'fs';
import { basename, dirname, extname, join, normalize, sep } from 'path/posix';
import matter from 'gray-matter';
import { createHash } from 'crypto';
import MarkdownIt from 'markdown-it';

const md = new MarkdownIt();

const noteList: {
    id: string;
    name: string;
    route: string[];
    created: number;
    updated: number;
    outline: [{ depth: number, title: string, id: string }];
    tags: string[];
    links: { alias: string; url: string }[];
    obsidianLinks: { alias: string; url: string }[];
    summary: string;
    images: string[];
}[] = [];
const graphNodes: { id: string; group: string; title: string; }[] = [];
const graphLinks: { source: string; target: string; group: string; }[] = [];

async function extractTags(content: string) {
    const tagPattern = /(^|\s)#(\w+)\b/g;
    return [...content.matchAll(tagPattern)].map(match => match[2]);
}

async function extractLinks(content: string) {
    const hyperlinkPattern = /(?<!!)\[([^\]]+)\]\(([^)\s"]+)(?:\s+"[^"]*")?\)/g;
    const obsidianLinkPattern = /\[\[([^\]|]+)\|?([^\]]+)?\]\]/g;
    const imageSrcPattern = /<img[^>]+src=["'](http[^"']+)["']/g;
    const referenceLinkPattern = /\[(\d+)\]:\s*(http[^\s]+)\s*"([^"]*)"/g;

    const hyperlinks = [...content.matchAll(hyperlinkPattern)].map(match => ({
        alias: match[1],
        url: match[2]
    }));

    const obsidianLinks = [...content.matchAll(obsidianLinkPattern)].map(match => ({
        alias: match[2] || match[1],
        url: match[1]
    }));

    const images = [...content.matchAll(imageSrcPattern)].map(match => match[1]);

    const referenceLinks = [...content.matchAll(referenceLinkPattern)].map(match => ({
        alias: match[3],
        url: match[2]
    }));

    const allLinks = hyperlinks.concat(referenceLinks);

    const filteredLinks = allLinks.filter(link => !images.includes(link.url));

    return { hyperlinks: filteredLinks, obsidianLinks, images };
}

function extractSummary(content: string) {
    const htmlContent = md.render(content);
    const plainText = htmlContent.replace(/<[^>]*>/g, '');
    return plainText.slice(0, 300).replace(/\n/g, ' ') + (plainText.length > 300 ? '...' : '');
}

function extractOutline(content: string) {
    const outline: { depth: number; title: string; id: string; }[] = [];
    const tokens = md.parse(content, {});

    tokens.forEach(token => {
        if (token.type === 'heading_open') {
            const level = parseInt(token.tag.slice(1));
            const title = tokens[tokens.indexOf(token) + 1].content;
            outline.push({ depth: level, title: title, id: title.toLowerCase().replace(/\s+/g, '-') });
        }
    });

    return outline;
}

function findNoteIdByUrl(url: string): string | null | undefined {
    const filteredNotes = noteList.filter(n => n.name === url);
    switch (filteredNotes.length) {
        case 0:
            return null;
        case 1:
            return filteredNotes[0].id;
        default:
            return filteredNotes.find(n => n.route.join(sep).concat(sep).concat(n.name) === url)?.id;
    }
}

async function generateNoteMeta(file: any, ROOT: string, withOutRoot: boolean) {
    try {
        const stat = await fs.stat(file);
        if (stat.isDirectory()) {
            const files = await fs.readdir(file);
            await Promise.all(files.map(f => generateNoteMeta(join(file, f), ROOT, withOutRoot)));
        } else if (extname(file) === '.md') {
            const content = await fs.readFile(file, 'utf8');
            const { data, content: mdContent } = matter(content);

            let tags: string[], hyperlinks, obsidianLinks: any[], images, summary, outline;
            if (Object.keys(data).length === 0) {
                tags = await extractTags(content);
                ({ hyperlinks, obsidianLinks, images } = await extractLinks(content));
                summary = extractSummary(content);
                outline = extractOutline(content);
            } else {
                tags = data.tags || [];
                hyperlinks = data.links || [];
                obsidianLinks = [];
                images = data.images || [];
                summary = data.summary || extractSummary(mdContent);
                outline = data.outline || extractOutline(mdContent);
            }

            tags = [...new Set(tags)];

            let path = normalize(dirname(file));
            if (withOutRoot) path = path.substring(normalize(ROOT).length);

            const hash = createHash('md5').update(file + content).digest('hex');

            const noteData = {
                id: hash,
                name: basename(file, '.md'),
                route: path ? path.split(sep) : [],
                created: stat.ctime.getTime(),
                updated: stat.mtime.getTime(),
                outline: outline,
                tags: tags,
                links: hyperlinks,
                obsidianLinks: obsidianLinks,
                summary: summary,
                images: images
            };

            noteList.push(noteData);

            graphNodes.push({ id: hash, group: 'note', title: noteData.name });
            tags.forEach((tag: string) => {
                graphNodes.push({ id: tag, group: 'tag', title: tag });
                graphLinks.push({ source: hash, target: tag, group: 'tag' });
            });

        } else {
            console.log(`Skipping non-markdown file: ${file}`);
        }
    } catch (err: any) {
        console.error(`Error processing file ${file}: ${err.message}`);
    }
}

function processGraphLinks() {
    noteList.forEach(note => {
        note.obsidianLinks.forEach((link) => {
            const targetId = findNoteIdByUrl(link.url);
            if (targetId) {
                graphLinks.push({ source: note.id, target: targetId, group: 'note' });
            }
        });
    });
}

export async function generateMetadata(files: string | string[], outputPath: string, withOutRoot: boolean) {
    if (typeof files === 'string') files = [files];

    await Promise.all(files.map(file => generateNoteMeta(file, file, withOutRoot)));
    console.log(`${noteList.length} notes processed!`);

    processGraphLinks();

    const metadata = {
        notedata: [...new Set(noteList)],
        graphdata: {
            nodes: [...new Set(graphNodes)],
            links: [...new Set(graphLinks)]
        }
    };

    if (!existsSync(outputPath)) await fs.mkdir(outputPath, { recursive: true });
    await fs.writeFile(join(outputPath, 'metadata.json'), JSON.stringify(metadata, null, 2), 'utf8');
}
