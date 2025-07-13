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
};
