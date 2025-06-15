/**
 * Map of ES features (by name) → earliest ES minVersion + AST detection hints
 * ES6 (2015) = 6, ES7 (2016) = 7, ES8 (2017) = 8, ES9 (2018) = 9,
 * ES10 (2019) = 10, ES11 (2020) = 11, ES12 (2021) = 12,
 * ES13 (2022) = 13, ES14 (2023) = 14, etc.
 */
const ES_FEATURES = {
  // ----------------------------------------------------------
  // ES6 / ES2015
  // ----------------------------------------------------------
  ArraySpread: {
    minVersion: 6,
    example: '[...arr]',
    astInfo: {
      nodeType: 'ArrayExpression',
      childType: 'SpreadElement',
    },
  },
  let: {
    minVersion: 6,
    example: 'let x = 10;',
    astInfo: {
      nodeType: 'VariableDeclaration',
      kind: 'let',
    },
  },
  const: {
    minVersion: 6,
    example: 'const x = 10;',
    astInfo: {
      nodeType: 'VariableDeclaration',
      kind: 'const',
    },
  },
  class: {
    minVersion: 6,
    example: 'class MyClass {}',
    astInfo: {
      nodeType: 'ClassDeclaration',
    },
  },
  extends: {
    minVersion: 6,
    example: 'class MyClass extends OtherClass {}',
    astInfo: {
      nodeType: 'ClassDeclaration',
      property: 'superClass',
    },
  },
  import: {
    minVersion: 6,
    example: 'import * as mod from "mod";',
    astInfo: {
      nodeType: 'ImportDeclaration',
    },
  },
  export: {
    minVersion: 6,
    example: 'export default x;',
    astInfo: {
      nodeType: 'ExportDeclaration',
    },
  },
  ArrowFunctions: {
    minVersion: 6,
    example: 'const fn = () => {};',
    astInfo: {
      nodeType: 'ArrowFunctionExpression',
    },
  },
  TemplateLiterals: {
    minVersion: 6,
    example: 'const str = `Hello, ${name}!`;',
    astInfo: {
      nodeType: 'TemplateLiteral',
    },
  },
  Destructuring: {
    minVersion: 6,
    example: 'const { x } = obj;',
    astInfo: {
      nodeType: 'ObjectPattern',
    },
  },
  DefaultParams: {
    minVersion: 6,
    example: 'function foo(x=10) {}',
    astInfo: {
      nodeType: 'AssignmentPattern',
    },
  },
  RestSpread: {
    minVersion: 6,
    example: 'function(...args) {}',
    astInfo: {
      nodeType: 'RestElement',
    },
  },
  ForOf: {
    minVersion: 6,
    example: 'for (const x of iterable) {}',
    astInfo: {
      nodeType: 'ForOfStatement',
    },
  },
  Map: {
    minVersion: 6,
    example: 'new Map()',
    astInfo: {
      nodeType: 'NewExpression',
      callee: 'Map',
    },
  },
  Set: {
    minVersion: 6,
    example: 'new Set()',
    astInfo: {
      nodeType: 'NewExpression',
      callee: 'Set',
    },
  },
  WeakMap: {
    minVersion: 6,
    example: 'new WeakMap()',
    astInfo: {
      nodeType: 'NewExpression',
      callee: 'WeakMap',
    },
  },
  WeakSet: {
    minVersion: 6,
    example: 'new WeakSet()',
    astInfo: {
      nodeType: 'NewExpression',
      callee: 'WeakSet',
    },
  },
  Promise: {
    minVersion: 6,
    example: 'new Promise((resolve, reject) => {})',
    astInfo: {
      nodeType: 'NewExpression',
      callee: 'Promise',
    },
  },
  PromiseResolve: {
    minVersion: 6,
    example: 'Promise.resolve(value)',
    astInfo: {
      nodeType: 'CallExpression',
      object: 'Promise',
      property: 'resolve',
    },
  },
  PromiseReject: {
    minVersion: 6,
    example: 'Promise.reject(value)',
    astInfo: {
      nodeType: 'CallExpression',
      object: 'Promise',
      property: 'reject',
    },
  },
  Symbol: {
    minVersion: 6,
    example: 'Symbol("desc")',
    astInfo: {
      nodeType: 'CallExpression',
      callee: 'Symbol',
    },
  },

  // ----------------------------------------------------------
  // ES7 / ES2016
  // ----------------------------------------------------------
  ExponentOperator: {
    minVersion: 7,
    example: 'a ** b',
    astInfo: {
      nodeType: 'BinaryExpression',
      operator: '**',
    },
  },
  ArrayPrototypeIncludes: {
    minVersion: 7,
    example: 'arr.includes(x)',
    astInfo: {
      nodeType: 'CallExpression',
      property: 'includes',
    },
  },

  // ----------------------------------------------------------
  // ES8 / ES2017
  // ----------------------------------------------------------
  AsyncAwait: {
    minVersion: 8,
    example: 'async function foo() { await bar(); }',
    astInfo: {
      nodeType: 'AwaitExpression',
    },
  },
  ObjectValues: {
    minVersion: 8,
    example: 'Object.values(obj)',
    astInfo: {
      nodeType: 'CallExpression',
      object: 'Object',
      property: 'values',
    },
  },
  ObjectEntries: {
    minVersion: 8,
    example: 'Object.entries(obj)',
    astInfo: {
      nodeType: 'CallExpression',
      object: 'Object',
      property: 'entries',
    },
  },
  StringPadStart: {
    minVersion: 8,
    example: 'str.padStart(10)',
    astInfo: {
      nodeType: 'CallExpression',
      property: 'padStart',
    },
  },
  StringPadEnd: {
    minVersion: 8,
    example: 'str.padEnd(10)',
    astInfo: {
      nodeType: 'CallExpression',
      property: 'padEnd',
    },
  },

  // ----------------------------------------------------------
  // ES9 / ES2018
  // ----------------------------------------------------------
  ObjectSpread: {
    minVersion: 9,
    example: 'const obj2 = { ...obj};',
    astInfo: {
      nodeType: 'ObjectExpression',
      childType: 'SpreadElement',
    },
  },
  AsyncIteration: {
    minVersion: 9,
    example: 'for await (const x of asyncIterable) {}',
    astInfo: {
      nodeType: 'ForAwaitStatement',
    },
  },
  PromiseFinally: {
    minVersion: 9,
    example: 'promise.finally(() => {})',
    astInfo: {
      nodeType: 'CallExpression',
      property: 'finally',
    },
  },

  // ----------------------------------------------------------
  // ES10 / ES2019
  // ----------------------------------------------------------
  ArrayFlat: {
    minVersion: 10,
    example: 'arr.flat()',
    astInfo: {
      nodeType: 'CallExpression',
      property: 'flat',
    },
  },
  ArrayFlatMap: {
    minVersion: 10,
    example: 'arr.flatMap(x => x)',
    astInfo: {
      nodeType: 'CallExpression',
      property: 'flatMap',
    },
  },
  ObjectFromEntries: {
    minVersion: 10,
    example: 'Object.fromEntries(entries)',
    astInfo: {
      nodeType: 'CallExpression',
      object: 'Object',
      property: 'fromEntries',
    },
  },
  OptionalCatchBinding: {
    minVersion: 10,
    example: 'try { ... } catch { ... }',
    astInfo: {
      nodeType: 'CatchClause',
      noParam: true,
    },
  },

  // ----------------------------------------------------------
  // ES11 / ES2020
  // ----------------------------------------------------------
  BigInt: {
    minVersion: 11,
    example: '123n',
    astInfo: {
      nodeType: 'BigIntLiteral',
    },
  },
  DynamicImport: {
    minVersion: 11,
    example: 'import("module.js")',
    astInfo: {
      nodeType: 'ImportExpression',
    },
  },
  OptionalChaining: {
    minVersion: 11,
    example: 'obj?.prop',
    astInfo: {
      nodeType: 'ChainExpression',
    },
  },
  NullishCoalescing: {
    minVersion: 11,
    example: 'a ?? b',
    astInfo: {
      nodeType: 'LogicalExpression',
      operator: '??',
    },
  },
  globalThis: {
    minVersion: 11,
    example: 'globalThis',
    astInfo: {
      nodeType: 'Identifier',
      name: 'globalThis',
    },
  },
  PromiseAllSettled: {
    minVersion: 11,
    example: 'Promise.allSettled(promises)',
    astInfo: {
      nodeType: 'CallExpression',
      property: 'allSettled',
    },
  },
  StringMatchAll: {
    minVersion: 11,
    example: 'str.matchAll(regex)',
    astInfo: {
      nodeType: 'CallExpression',
      property: 'matchAll',
    },
  },

  // ----------------------------------------------------------
  // ES12 / ES2021
  // ----------------------------------------------------------
  LogicalAssignment: {
    minVersion: 12,
    example: 'x &&= y;',
    astInfo: {
      nodeType: 'AssignmentExpression',
      operators: ['&&=', '||=', '??='],
    },
  },
  NumericSeparators: {
    minVersion: 12,
    example: '1_000_000',
    astInfo: {
      nodeType: 'NumericLiteralWithSeparator',
    },
  },
  StringReplaceAll: {
    minVersion: 12,
    example: 'str.replaceAll("a", "b")',
    astInfo: {
      nodeType: 'CallExpression',
      property: 'replaceAll',
    },
  },
  PromiseAny: {
    minVersion: 12,
    example: 'Promise.any(promises)',
    astInfo: {
      nodeType: 'CallExpression',
      property: 'any',
    },
  },
  WeakRef: {
    minVersion: 12,
    example: 'new WeakRef(obj)',
    astInfo: {
      nodeType: 'NewExpression',
      callee: 'WeakRef',
    },
  },
  FinalizationRegistry: {
    minVersion: 12,
    example: 'new FinalizationRegistry(cb)',
    astInfo: {
      nodeType: 'NewExpression',
      callee: 'FinalizationRegistry',
    },
  },

  // ----------------------------------------------------------
  // ES13 / ES2022
  // ----------------------------------------------------------
  TopLevelAwait: {
    minVersion: 13,
    example: 'await foo()',
    astInfo: {
      nodeType: 'AwaitExpression',
      topLevel: true,
    },
  },
  PrivateClassFields: {
    minVersion: 13,
    example: 'class MyClass { #x = 1; }',
    astInfo: {
      nodeType: 'PropertyDefinition',
      isPrivate: true,
    },
  },
  ClassStaticBlocks: {
    minVersion: 13,
    example: 'class MyClass { static {} }',
    astInfo: {
      nodeType: 'StaticBlock',
    },
  },
  ErgonomicBrandChecks: {
    minVersion: 13,
    example: '#field in obj',
    astInfo: {
      nodeType: 'BinaryExpression',
      operator: 'in',
      leftIsPrivate: true,
    },
  },
  ErrorCause: {
    minVersion: 13,
    example: 'new Error("...", { cause: e })',
    astInfo: {
      nodeType: 'NewExpression',
      callee: 'Error',
      hasOptionsCause: true,
    },
  },
  ArrayPrototypeAt: {
    minVersion: 13,
    example: 'arr.at(-1)',
    astInfo: {
      nodeType: 'CallExpression',
      property: 'at',
    },
  },

  // ----------------------------------------------------------
  // ES14 / ES2023
  // ----------------------------------------------------------
  Hashbang: {
    minVersion: 14,
    example: '#!/usr/bin/env node',
    astInfo: {
      nodeType: 'Hashbang',
    },
  },
  ArrayToReversed: {
    minVersion: 14,
    example: 'arr.toReversed()',
    astInfo: {
      nodeType: 'CallExpression',
      property: 'toReversed',
    },
  },
  ArrayToSorted: {
    minVersion: 14,
    example: 'arr.toSorted(compareFn)',
    astInfo: {
      nodeType: 'CallExpression',
      property: 'toSorted',
    },
  },
  ArrayToSpliced: {
    minVersion: 14,
    example: 'arr.toSpliced(start, deleteCount, ...)',
    astInfo: {
      nodeType: 'CallExpression',
      property: 'toSpliced',
    },
  },
  ArrayWith: {
    minVersion: 14,
    example: 'arr.with(index, value)',
    astInfo: {
      nodeType: 'CallExpression',
      property: 'with',
    },
  },
};

const NODE_TYPES = {
  VARIABLE_DECLARATION: 'VariableDeclaration',
  ARROW_FUNCTION_EXPRESSION: 'ArrowFunctionExpression',
  CHAIN_EXPRESSION: 'ChainExpression',
  LOGICAL_EXPRESSION: 'LogicalExpression',
  NEW_EXPRESSION: 'NewExpression',
};

const POLYFILL_PATTERNS = [
  // Array methods
  { pattern: /Array\.prototype\.toSorted/, feature: 'ArrayToSorted' },
  { pattern: /Array\.prototype\.findLast/, feature: 'ArrayFindLast' },
  { pattern: /Array\.prototype\.findLastIndex/, feature: 'ArrayFindLastIndex' },
  { pattern: /Array\.prototype\.at/, feature: 'ArrayAt' },

  // String methods
  { pattern: /String\.prototype\.replaceAll/, feature: 'StringReplaceAll' },
  { pattern: /String\.prototype\.matchAll/, feature: 'StringMatchAll' },
  { pattern: /String\.prototype\.at/, feature: 'StringAt' },

  // Object methods
  { pattern: /Object\.hasOwn/, feature: 'ObjectHasOwn' },

  // Promise methods
  { pattern: /Promise\.any/, feature: 'PromiseAny' },

  // RegExp methods
  { pattern: /RegExp\.prototype\.exec/, feature: 'RegExpExec' },

  // Global methods
  { pattern: /globalThis/, feature: 'GlobalThis' },
];

const IMPORT_PATTERNS = [
  { pattern: /from\s+['"]core-js\/modules\/es\.array\.to-sorted['"]/, feature: 'ArrayToSorted' },
  { pattern: /from\s+['"]core-js\/modules\/es\.array\.find-last['"]/, feature: 'ArrayFindLast' },
  { pattern: /from\s+['"]core-js\/modules\/es\.array\.find-last-index['"]/, feature: 'ArrayFindLastIndex' },
  { pattern: /from\s+['"]core-js\/modules\/es\.array\.at['"]/, feature: 'ArrayAt' },
  { pattern: /from\s+['"]core-js\/modules\/es\.string\.replace-all['"]/, feature: 'StringReplaceAll' },
  { pattern: /from\s+['"]core-js\/modules\/es\.string\.match-all['"]/, feature: 'StringMatchAll' },
  { pattern: /from\s+['"]core-js\/modules\/es\.string\.at['"]/, feature: 'StringAt' },
  { pattern: /from\s+['"]core-js\/modules\/es\.object\.has-own['"]/, feature: 'ObjectHasOwn' },
  { pattern: /from\s+['"]core-js\/modules\/es\.promise\.any['"]/, feature: 'PromiseAny' },
  { pattern: /from\s+['"]core-js\/modules\/es\.regexp\.exec['"]/, feature: 'RegExpExec' },
  { pattern: /from\s+['"]core-js\/modules\/es\.global-this['"]/, feature: 'GlobalThis' },
];

module.exports = {
  ES_FEATURES,
  NODE_TYPES,
  POLYFILL_PATTERNS,
  IMPORT_PATTERNS,
};
