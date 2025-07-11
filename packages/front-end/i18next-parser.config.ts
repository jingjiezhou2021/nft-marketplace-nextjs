module.exports = {
	locales: ['en', 'zh'],
	defaultNamespace: 'common',
	defaultValue: (locale: string, namespace: string, key: string) => {
		if (locale === 'en') {
			return key;
		} else {
			return '';
		}
	},
	output: 'public/locales/$LOCALE/$NAMESPACE.json',
	input: ['pages/**/*.{js,jsx,ts,tsx}', 'components/**/*.{js,jsx,ts,tsx}'],
	createOldCatalogs: false,
	keepRemoved: false,
	sort: true,
	lexers: {
		tsx: [
			{
				lexer: 'JavascriptLexer',
				functions: ['t'], // Array of functions to match
				namespaceFunctions: ['useTranslation'], // Array of functions to match for namespace
			},
		],
		ts: [
			{
				lexer: 'JavascriptLexer',
				functions: ['t'], // Array of functions to match
				namespaceFunctions: ['useTranslation'], // Array of functions to match for namespace
			},
		],
	},
};
