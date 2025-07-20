import * as dateFnsLocales from 'date-fns/locale';

export default function getDateFnsLocale(lng: string) {
	switch (lng) {
		case 'en':
			return dateFnsLocales.enUS;
		case 'zh':
			return dateFnsLocales.zhCN;
		default:
			return dateFnsLocales.enUS;
	}
}
