module.exports = {
  mount: {
    src: '/',
    'src/assets': {url: "/assets", static: true, resolve: false}
  },
  plugins: [
    '@snowpack/plugin-typescript',
    'snowpack-plugin-less'
  ],
};