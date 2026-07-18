import nextVitals from 'eslint-config-next/core-web-vitals';
import prettier from 'eslint-config-prettier';

const eslintConfig = [
  ...nextVitals,
  prettier,
  {
    ignores: ['.next/**', 'node_modules/**'],
  },
  {
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react/no-unescaped-entities': 'off',
    },
  },
];

export default eslintConfig;
