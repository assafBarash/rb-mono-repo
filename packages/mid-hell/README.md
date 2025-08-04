# TypeScript Type Union Generator

A TypeScript script that scans files for specific `export type` statements and generates a union type file with all found types.

## Features

- ✅ Uses `fast-glob` for efficient file scanning
- ✅ Uses `ts-morph` for reliable TypeScript AST parsing and generation
- ✅ Functional programming style with immutable data structures
- ✅ Type-safe with comprehensive TypeScript types
- ✅ Supports both programmatic and CLI usage

## Installation

```bash
pnpm install
```

## Usage

### Programmatic Usage

```typescript
import { generateTypeUnion } from './index.js';

await generateTypeUnion({
  src: ['src/**/*.ts', 'lib/**/*.ts'],           // Glob patterns to scan
  dst: 'src/generated/union-types.ts',          // Output file path
  ingredients: ['PermissionLiteral', 'UserRole'], // Type names to look for
  name: 'AllPermissions'                        // Name of the generated union type
});
```

### CLI Usage

```bash
# Build and run via npm script
npm run cli -- --src "src/**/*.ts,lib/**/*.ts" --dst "src/generated/union.ts" --ingredients "PermissionLiteral,UserRole" --name "AllPermissions"

# Or build first, then run directly
npm run build
node ./dist/cli.js --src "src/**/*.ts" --dst "output.ts" --ingredients "Type1,Type2" --name "UnionType"
```

### Example

Given these input files:

```typescript
// src/permissions.ts
export type PermissionLiteral = 'read' | 'write' | 'delete';

// src/roles.ts  
export type UserRole = 'admin' | 'user' | 'guest';

// src/actions.ts
export type ActionType = 'create' | 'update' | 'view';
```

Running:
```bash
npm run cli -- --src "src/**/*.ts" --dst "src/generated/union.ts" --ingredients "PermissionLiteral,UserRole,ActionType" --name "AllPermissions"
```

Generates:
```typescript
// This file was auto-generated. Do not edit manually.

import type { PermissionLiteral } from '../permissions';
import type { UserRole } from '../roles';
import type { ActionType } from '../actions';

export type AllPermissions = 
  | PermissionLiteral
  | UserRole
  | ActionType;
```

## Configuration

The script accepts the following options:

- **`src`**: Array of glob patterns to scan for TypeScript files
- **`dst`**: Output file path where the generated union type will be written
- **`ingredients`**: Array of type names to search for in the scanned files
- **`name`**: Name for the generated union type

## Code Style

This script follows functional programming principles:

- Uses `type` over `interface`
- Uses `const` arrow functions over `function` declarations  
- Uses `Array.prototype` methods over `while`/`for` loops
- Favors immutable code patterns with `readonly` types
- Avoids `let` in favor of `const` and functional approaches like `reduce`
