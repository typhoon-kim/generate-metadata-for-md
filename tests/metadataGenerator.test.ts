import { generateMetadata } from '../src/metadataGenerator.js';
import fs from 'fs/promises';
import path from 'path';

describe('Metadata Generator', () => {
  const contentDir = './tests/content';
  const outputDir = './tests/output';

  beforeAll(async () => {
    await fs.mkdir(contentDir, { recursive: true });
    await fs.mkdir(outputDir, { recursive: true });
  });

  afterAll(async () => {
    await fs.rm(contentDir, { recursive: true });
    await fs.rm(outputDir, { recursive: true });
  });

  test('creates metadata index', async () => {
    const markdownContent = `
    # Test Document
    This is a test document with #tag and a [link](http://example.com).

    ## Section 1
    Some content here.
    `;

    await fs.writeFile(path.join(contentDir, 'test.md'), markdownContent);

    await generateMetadata(contentDir, outputDir, true);

    const metadata = JSON.parse(await fs.readFile(path.join(outputDir, 'metadata.json'), 'utf8'));

    expect(metadata.notedata).toHaveLength(1);
    expect(metadata.notedata[0].name).toBe('test');
    expect(metadata.notedata[0].tags).toContain('tag');
    expect(metadata.notedata[0].links[0].url).toBe('http://example.com');
  });
});
