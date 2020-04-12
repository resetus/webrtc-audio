module.exports = {
  presets: [
    `@babel/preset-react`,
    [
      `@babel/preset-env`,
      {
        targets: {
          node: `current`,
        },
      },
    ],
  ],
  plugins: [
    [
      "@babel/plugin-transform-runtime",
      {
        "absoluteRuntime": false,
        "corejs": false,
        "helpers": false,
        "regenerator": true,
        "useESModules": false
      }
    ]
  ]
};
