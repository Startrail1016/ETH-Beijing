#!/usr/bin/env node
import { parseArgs } from 'node:util';
import { init } from './cli/init.js';
import { main } from './main.js';
import { version } from './version.js';

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection:', error);
});

let values;

try {
  const args = parseArgs({
    options: {
      init: { type: 'boolean', short: 'i' },
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
    },
  });
  values = args.values;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
} catch (err) {
  console.error('Unrecognized argument. For help, run `base-mcp --help`.');
  process.exit(0);
}

if (values.help) {
  console.log(`
Usage: base-mcp [options]

Options:
  -i, --init     Initialize configuration
  -h, --help     Show this help message
  -v, --version  Show version number
  `);
  process.exit(0);
}

if (values.version) {
  console.log(version);
  process.exit(0);
}

if (values.init) {
  await init();
} else {
  main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
  });
}
