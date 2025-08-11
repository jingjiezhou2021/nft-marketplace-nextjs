import { ConfigProvider, theme } from 'antd';
import { useTheme } from 'next-themes';
import { ReactNode } from 'react';

export default function AntDesignProvider({
	children,
}: {
	children: ReactNode;
}) {
	const { theme: currentTheme } = useTheme();
	return (
		<ConfigProvider
			theme={{
				algorithm:
					currentTheme === 'light'
						? theme.defaultAlgorithm
						: theme.darkAlgorithm,
				token:
					currentTheme === 'light'
						? {
								colorPrimary: '#a419b1',
							}
						: {
								colorPrimary: '#7f22fe',
							},
			}}
		>
			{children}
		</ConfigProvider>
	);
}
