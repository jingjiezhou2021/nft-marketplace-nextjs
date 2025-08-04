import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
	// import.meta.dirname is available after Node.js v20.11.0
	baseDirectory: import.meta.dirname,
});

const eslintConfig = [
	...compat.config({
		ignorePatterns: ['graphql/gql/**/*'],
		extends: [
			'next/core-web-vitals',
			'next/typescript',
			'plugin:prettier/recommended',
		],
		rules: {
			'@typescript-eslint/no-unused-vars': 'warn',
			'@typescript-eslint/no-require-imports': 'warn',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
		},
	}),
];

export default eslintConfig;
