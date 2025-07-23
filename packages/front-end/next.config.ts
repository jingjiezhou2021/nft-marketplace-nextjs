const { i18n } = require('./next-i18next.config');
module.exports = {
	i18n,
	transpilePackages: [
		'antd',
		'@ant-design',
		'rc-util',
		'rc-pagination',
		'rc-picker',
	],
	async redirects() {
		return [
			{
				source: '/settings',
				destination: '/settings/profile',
				permanent: true,
			},
		];
	},
	images: {
		remotePatterns: [new URL('http://localhost:4500/**')],
	},
};
