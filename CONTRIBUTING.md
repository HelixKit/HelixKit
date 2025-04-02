# Contributing to Helix-Kit

Thank you for your interest in contributing to Helix-Kit! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0.0 or higher)
- [Git](https://git-scm.com/)

### Setup Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally

   ```bash
   git clone https://github.com/your-username/helixkit.git
   cd helixkit
   ```

3. Install dependencies

   ```bash
   bun install
   ```

4. Create a branch for your feature or bugfix

   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Workflow

1. Make your changes
2. Run the tests to ensure everything works

   ```bash
   bun test
   ```

3. Lint your code to ensure it meets our standards

   ```bash
   bun run lint
   ```

4. Format your code

   ```bash
   bun run format
   ```

5. Commit your changes with a descriptive message

   ```bash
   git commit -m "feat: add new feature"
   ```

6. Push your branch to your fork

   ```bash
   git push origin feature/your-feature-name
   ```

7. Submit a pull request to the main repository

## Project Structure

- `src/` - Source code
  - `core/` - Core framework functionality
    - `reactivity.ts` - Reactive primitives
    - `component.ts` - Component system
    - `render.ts` - Rendering logic
    - `diff.ts` - Virtual DOM diffing algorithm
    - `scheduler.ts` - Task scheduling and prioritization
    - `store.ts` - State management
    - `router.ts` - Client-side routing
  - `compiler/` - Build tools
    - `transform.ts` - JSX transformation
    - `bundle.ts` - Module bundling
    - `optimize.ts` - Production optimizations
  - `ssr/` - Server-side rendering
    - `render.ts` - Server-side rendering utilities
    - `hydrate.ts` - Client-side hydration
    - `streaming.ts` - Streaming renderer
  - `cli/` - Command-line interface
    - `create.ts` - Project scaffolding
    - `dev.ts` - Development server
    - `build.ts` - Production builds
  - `utils/` - Utility functions
    - `jsx.ts` - JSX runtime
    - `dom.ts` - DOM utilities
    - `error.ts` - Error handling
    - `lazy.ts` - Code splitting utilities
- `templates/` - Project templates
  - `basic/` - Standard client-side template
  - `ssr/` - Server-side rendering template
- `examples/` - Example applications
  - `todo-app/` - Todo application example
  - `e-commerce/` - E-commerce application example
  - `blog/` - Blog example
- `docs/` - Documentation
  - `api/` - API reference
  - `guides/` - Comprehensive guides
- `tests/` - Test suite
  - `core/` - Core tests
  - `ssr/` - SSR tests
  - `cli/` - CLI tests

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor:` - A code change that neither fixes a bug nor adds a feature
- `perf:` - A code change that improves performance
- `test:` - Adding missing tests or correcting existing tests
- `build:` - Changes that affect the build system or external dependencies
- `ci:` - Changes to our CI configuration files and scripts
- `chore:` - Other changes that don't modify src or test files

## Pull Request Process

1. Update the README.md or documentation with details of changes if appropriate
2. Update the CHANGELOG.md with details of changes if appropriate
3. The PR should work with all tests passing
4. Ensure the PR description clearly describes the problem and solution
5. Include the relevant issue number if applicable

## Testing

- Write tests for all new features and bugfixes
- Run the test suite before submitting a PR
- Ensure your changes don't break existing functionality

## Documentation

- Update documentation for all new features and changes
- Use clear, concise language
- Include examples where appropriate

## Style Guide

- We use ESLint and Prettier to enforce code style
- Follow TypeScript best practices
- Write clear, self-documenting code with descriptive variable names

## Questions?

If you have any questions, feel free to open an issue or reach out to the maintainers.

Thank you for contributing to Helix-Kit!
