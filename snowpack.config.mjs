export default {
  mount: {
    src: '/built',
    public: { url: '/', static: true, resolve: false },
  },
  plugin: [
    '@prefresh/snowpack',
    '@snowpack/plugin-dotenv',
    [
      '@snowpack/plugin-babel',
      {
        input: ['.js', '.mjs', '.jsx', '.ts', '.tsx'], // (optional) specify files for Babel to transform
        transformOptions: {
          pragma: 'h',
          pragmaFrag: 'Fragment',
        },
      },
    ],
    '@snowpack/plugin-typescript',
  ],
};