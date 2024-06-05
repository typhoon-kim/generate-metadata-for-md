#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path';
import { createMetadataIndex } from './metadataGenerator.js';

const program = new Command();

program
  .version(__APP_VERSION__)
  .description(__APP_DESCRIPTION__)
  .requiredOption('-c, --content <path>', 'Markdown content directory')
  .requiredOption('-o, --output <path>', 'Output directory for metadata.json')
  .parse(process.argv);

const options = program.opts();

const markdownDir = path.resolve(options.content);
const outputDir = path.resolve(options.output);

createMetadataIndex(markdownDir, outputDir);

console.log(`Metadata index created at ${path.join(outputDir, 'metadata.json')}`);
