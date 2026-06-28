import noTransitionAll from "./rules/no-transition-all.js";

/** @type {import('eslint').ESLint.Plugin} */
const labCustomPlugin = {
  rules: {
    "no-transition-all": noTransitionAll,
  },
};

export default labCustomPlugin;
