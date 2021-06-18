module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    ignorePatterns: ['packages/*/src/types', 'packages/*/dist'],
    extends: ['airbnb-base', 'plugin:sonarjs/recommended', 'prettier'],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'prettier'],
    rules: {
        'class-methods-use-this': ['off'],
        'prettier/prettier': ['warn'],
        'import/extensions': ['off'],
        // Allow _underscore class methods
        'no-underscore-dangle': ['off'],
        // Allow for-of iterators
        'no-restricted-syntax': [
            'error',
            'ForInStatement',
            'LabeledStatement',
            'WithStatement',
        ],
        // TypeScript's compiler already checks for duplicate function implementations.
        // (This rule prevents method overloading)
        'no-dupe-class-members': ['off'],
    },
    settings: {
        // Apply special parsing for TypeScript files
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx', '.d.ts'],
        },
        // Append 'ts' extensions to Airbnb 'import/resolver' setting
        'import/resolver': {
            node: {
                extensions: ['.mjs', '.js', '.json', '.ts', '.d.ts'],
            },
        },
        // Append 'ts' extensions to Airbnb 'import/extensions' setting
        'import/extensions': ['.js', '.mjs', '.jsx', '.ts', '.tsx', '.d.ts'],
        // Resolve type definition packages
        'import/external-module-folders': [
            'node_modules',
            'node_modules/@types',
        ],
    },
};
