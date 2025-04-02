#!/usr/bin/env bun

// CLI module exports

export * from './create';
export * from './dev';
export * from './build';
export * from './generate';

// CLI entry point
import { program } from 'commander';
import { createCommand } from './create';
import { devCommand } from './dev';
import { buildCommand } from './build';
import { generateCommand } from './generate';

// Setup CLI program
program.name('helix').description('Helix framework CLI').version('0.1.0');

// Register commands
createCommand(program);
devCommand(program);
buildCommand(program);
generateCommand(program);

// Run the CLI
program.parse(process.argv);
