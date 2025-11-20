module.exports = {
  root: true,
  extends: ["next", "next/core-web-vitals"],
  // Ignore complex animation primitives from linting to avoid false-positive
  // React Compiler / react-hooks checks that are intended for application code.
  ignorePatterns: ["components/animate-ui/**", "components/motion-primitives/**", "components/gsap/**"],
  overrides: [
    {
      files: ["components/animate-ui/**", "components/motion-primitives/**", "components/gsap/**"],
      rules: {
        // These files use dynamic motion/animation patterns that trip strict react-hooks checks
        "react-hooks/exhaustive-deps": "off",
        "react-hooks/static-components": "off",
        "react-hooks/preserve-manual-memoization": "off",
        "react-hooks/refs": "off",
        "react-hooks/set-state-in-effect": "off",
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
    {
      files: ["app/api/**"],
      rules: {
        // Relax @typescript-eslint/no-explicit-any for api route handlers
        "@typescript-eslint/no-explicit-any": "off",
      },
    },
  ],
};
