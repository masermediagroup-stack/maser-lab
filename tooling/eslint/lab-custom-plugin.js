import noCrossProjectImports from "./rules/no-cross-project-imports.js";
import noDitherRuntimeShellImports from "./rules/no-dither-runtime-shell-imports.js";
import noTransitionAll from "./rules/no-transition-all.js";

/** @type {import('eslint').ESLint.Plugin} */
const labCustomPlugin = {
  rules: {
    "no-transition-all": noTransitionAll,
    "no-cross-project-imports": noCrossProjectImports,
    "no-dither-runtime-shell-imports": noDitherRuntimeShellImports,
  },
};

export default labCustomPlugin;
