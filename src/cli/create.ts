/**
 * Project creation for Helix CLI
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import type { Command } from 'commander';

/**
 * Available project templates
 */
const TEMPLATES = ['basic', 'ssr', 'spa', 'pwa'];

/**
 * Registers the create command
 */
export function createCommand(program: Command): void {
  program
    .command('create <project-name>')
    .description('Create a new Helix project')
    .option('-t, --template <template>', 'Project template', 'basic')
    .option('--ts', 'Use TypeScript', false)
    .option('--no-install', 'Skip installing dependencies', false)
    .action(async (projectName, options) => {
      try {
        await createProject(projectName, options);
      } catch (error) {
        console.error('Failed to create project:', error);
        process.exit(1);
      }
    });
}

/**
 * Creates a new Helix project
 */
export async function createProject(
  projectName: string,
  options: {
    template: string;
    ts: boolean;
    install: boolean;
  }
): Promise<void> {
  const { template = 'basic', ts = false, install = true } = options;

  // Validate template
  if (!TEMPLATES.includes(template)) {
    throw new Error(
      `Invalid template: ${template}. Available templates: ${TEMPLATES.join(', ')}`
    );
  }

  console.log(`Creating a new Helix project: ${projectName}`);

  const projectDir = path.resolve(process.cwd(), projectName);

  // Check if directory already exists
  if (fs.existsSync(projectDir)) {
    throw new Error(`Directory ${projectName} already exists`);
  }

  // Create project directory
  fs.mkdirSync(projectDir, { recursive: true });

  // Copy template files
  const templateDir = path.join(__dirname, '..', '..', 'templates', template);
  copyTemplate(templateDir, projectDir, ts);

  // Create package.json
  createPackageJson(projectDir, projectName, template, ts);

  // Install dependencies
  if (install) {
    console.log('Installing dependencies...');
    execSync('bun install', { cwd: projectDir, stdio: 'inherit' });
  }

  console.log(`
Project ${projectName} created successfully!

Next steps:
  cd ${projectName}
  ${install ? '' : 'bun install'}
  bun dev

Happy coding with Helix-Kit! 🚀

Documentation:
  https://github.com/your-org/helix-kit/docs

Examples:
  https://github.com/your-org/helix-kit/examples
  `);
}

/**
 * Copies template files to project directory
 */
function copyTemplate(
  sourceDir: string,
  targetDir: string,
  useTypeScript: boolean
): void {
  const files = fs.readdirSync(sourceDir);

  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);

    if (fs.statSync(sourcePath).isDirectory()) {
      fs.mkdirSync(targetPath, { recursive: true });
      copyTemplate(sourcePath, targetPath, useTypeScript);
      continue;
    }

    // Skip files that shouldn't be copied
    if (file === 'package.json' || file === 'node_modules') {
      continue;
    }

    // Special handling for server/{index.ts} placeholder (for git tracking)
    if (file === '{index.ts}') {
      const newName = 'index.ts';
      fs.copyFileSync(sourcePath, path.join(targetDir, newName));
      continue;
    }

    // Handle TypeScript conversion
    if (!useTypeScript && file.endsWith('.ts')) {
      const jsFile = file.replace(/\.ts$/, '.js');
      const jsContent = convertTsToJs(fs.readFileSync(sourcePath, 'utf-8'));
      fs.writeFileSync(path.join(targetDir, jsFile), jsContent);
      continue;
    }

    if (!useTypeScript && file.endsWith('.tsx')) {
      const jsxFile = file.replace(/\.tsx$/, '.jsx');
      const jsxContent = convertTsToJs(fs.readFileSync(sourcePath, 'utf-8'));
      fs.writeFileSync(path.join(targetDir, jsxFile), jsxContent);
      continue;
    }

    // Otherwise, copy the file as is
    fs.copyFileSync(sourcePath, targetPath);
  }
}

/**
 * Simple TypeScript to JavaScript converter
 */
function convertTsToJs(content: string): string {
  // Remove type annotations
  return content
    .replace(/:\s*[A-Za-z<>[\]|&]+/g, '') // Remove type annotations
    .replace(/<[A-Za-z<>[\]|&,\s]+>/g, '') // Remove generic type parameters
    .replace(/interface\s+\w+\s*\{[\s\S]*?\}/g, '') // Remove interfaces
    .replace(/type\s+\w+\s*=[\s\S]*?;/g, ''); // Remove type aliases
}

/**
 * Creates package.json for a new project
 */
function createPackageJson(
  projectDir: string,
  projectName: string,
  template: string,
  useTypeScript: boolean
): void {
  const packageJson = {
    name: projectName,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'helix-kit dev',
      build: 'helix-kit build',
      start: 'bun serve dist',
    },
    dependencies: {
      'helix-kit': '^0.1.0',
    },
    devDependencies: {
      bun: '^1.0.0',
    },
  };

  // Add template-specific scripts
  if (template === 'ssr') {
    packageJson.scripts.dev = 'helix-kit dev --ssr';
    packageJson.scripts.build = 'helix-kit build --ssr';
    packageJson.scripts.start = 'bun dist/server/index.js';
  }

  // Add TypeScript dependencies if needed
  if (useTypeScript) {
    packageJson.devDependencies = {
      ...packageJson.devDependencies,
    };
    // Add TypeScript-specific deps
    (packageJson.devDependencies as Record<string, string>)['typescript'] = '^5.0.0';
    (packageJson.devDependencies as Record<string, string>)['@types/bun'] = '^1.0.0';
  }

  fs.writeFileSync(
    path.join(projectDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
}
