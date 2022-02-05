module.exports = {
    parserOptions: {
        ecmaVersion: 'esnext',
        sourceType: 'module',
    },
    env: {
        es6: true,
        browser: true,
        commonjs: true,
        node: true,
    },
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier'],
    extends: [
        'prettier',
        'eslint:recommended',
        'plugin:react/jsx-runtime',
        'plugin:prettier/recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        // indent: ['warn', 4],
        'no-console': 0,
        'prettier/prettier': 'warn',
        '@typescript-eslint/ban-types': ['warn'],
        '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true, argsIgnorePattern: '^_' }],
    },
};
