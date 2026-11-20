module.exports = function (api) {
  api.cache(true);
  return {
    // Sin plugin manual de worklets/reanimated: lo gestiona babel-preset-expo y nativewind/babel.
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
  };
};
