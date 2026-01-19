/**
 * @see https://prettier.io/docs/configuration
 * @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions}
 */
export default {
    semi: true,
    singleQuote: true,
    printWidth: 80,
    jsxSingleQuote: false,
    bracketSameLine: false,
    arrowParens: 'always',
    proseWrap: 'preserve',
    singleAttributePerLine: true,
    htmlWhitespaceSensitivity: 'css',
    useTabs: false,
    endOfLine: 'lf',
    trailingComma: 'all',
    tabWidth: 4,
    plugins: ['prettier-plugin-tailwindcss'],
    tailwindAttributes: ['classList', 'className'],
    tailwindFunctions: ['cn', 'clsx', 'cva', 'cx'],
};
