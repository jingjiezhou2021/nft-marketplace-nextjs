import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';
import {
	IconCurrencyEthereum,
	IconGasStation,
	IconMoon,
	IconSun,
} from '@tabler/icons-react';
import ButtonSwitch from './button-switch';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function StatusBar(props: React.ComponentProps<'div'>) {
	const { theme, setTheme } = useTheme();
	const [themeChoice, setThemeChoice] = useState(0);
	const [currencyChoice, setCurrencyChoice] = useState(0);
	useEffect(() => {
		setThemeChoice(theme === 'light' ? 0 : 1);
	}, [theme]);
	return (
		<div
			{...props}
			className={cn(
				'flex justify-between w-full px-4 bg-sidebar border-border border-t text-muted-foreground text-xs font-light py-1',
				props.className,
			)}
		>
			<div className="flex items-center">
				<div className="flex items-center gap-2">
					<span className="relative flex size-2">
						<span className="rounded-full bg-primary absolute inline-flex size-full animate-ping opacity-75"></span>
						<span className="rounded-full bg-primary relative inline-flex size-2"></span>
					</span>
					<span className="leading-normal">Live</span>
				</div>
				<Separator
					orientation="vertical"
					className="mx-4 data-[orientation=vertical]:h-2/3"
				/>
				<div className="fresnel-container fresnel-greaterThanOrEqual-xl fresnel-«Rdpakmlrnb» contents"></div>
				<a
					className="cursor-pointer no-underline disabled:pointer-events-none disabled:opacity-40"
					href="/tos"
				>
					<span className="leading-normal text-text-secondary">
						Terms of Service
					</span>
				</a>
				<Separator
					orientation="vertical"
					className="mx-4 data-[orientation=vertical]:h-2/3"
				/>
				<a
					className="cursor-pointer no-underline disabled:pointer-events-none disabled:opacity-40"
					href="/privacy"
				>
					<span className="leading-normal text-text-secondary">
						Privacy Policy
					</span>
				</a>
			</div>
			<div className="flex items-center">
				<div className="flex items-center gap-1 text-text-secondary">
					<IconCurrencyEthereum
						size={12}
						className="text-primary"
					/>
					<span className="leading-normal">
						<span className="font-mono">$3,431.97</span>
					</span>
				</div>
				<Separator
					orientation="vertical"
					className="mx-4 data-[orientation=vertical]:h-2/3"
				/>
				<div className="flex items-center gap-1 text-text-secondary">
					<IconGasStation
						size={12}
						className="text-primary"
					/>
					<span className="leading-normal">
						<span className="font-mono">0.02</span> GWEI
					</span>
				</div>
				<Separator
					orientation="vertical"
					className="mx-4 data-[orientation=vertical]:h-2/3"
				/>
				<div className="flex items-center gap-2">
					<ButtonSwitch
						buttons={[
							<IconSun key="sun" />,
							<IconMoon key="moon" />,
						].map((icon, index) => {
							return {
								content: icon,
								clickCb() {
									setThemeChoice(index);
									setTheme(index === 0 ? 'light' : 'dark');
								},
							};
						})}
						choice={themeChoice}
					/>
					<ButtonSwitch
						buttons={['Crypto', 'USD'].map((item, index) => ({
							content: (
								<span
									className="text-xs font-light"
									key={item}
								>
									{item}
								</span>
							),
							clickCb() {
								setCurrencyChoice(index);
							},
						}))}
						choice={currencyChoice}
					/>
				</div>
			</div>
		</div>
	);
}
