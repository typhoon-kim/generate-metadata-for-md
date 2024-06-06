#!/usr/bin/env node

import { Command } from 'commander';
import path from 'path/posix';
import { generateMetadata } from './metadataGenerator.js';
import packageJson from '../package.json' assert {type: 'json'};

const program = new Command();

program
  .version(JSON.stringify(packageJson.version))
  .description(JSON.stringify(packageJson.description))
  .option('-c, --content <path>', 'Markdown content directory', process.cwd() + '/content')
  .option('-o, --output <path>', 'Output directory for metadata.json', process.cwd() + '/output')
  .option('-w, --without-root', 'Exclude root from paths', false)
  .parse(process.argv);

const options = program.opts();

const markdownDir = path.resolve(options.content);
const outputDir = path.resolve(options.output);
const withOutRoot = options.withoutRoot;

generateMetadata(markdownDir, outputDir, withOutRoot);

console.log(`Metadata index created at ${path.join(outputDir, 'metadata.json')}`);