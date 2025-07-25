import { emojiAvatarForAddress } from '@/lib/emojiAvatarForAddress';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

export default function EmojiAvatar({
	children,
	address,
	className,
}: {
	children?: ReactNode;
	address: string;
	className?: string;
}) {
	const emojiAvatar = emojiAvatarForAddress(address);
	return (
		<div
			className={cn(
				'size-[24px] flex justify-center items-center text-3xl',
				className,
			)}
			style={{
				backgroundColor: emojiAvatar.color,
				borderColor: emojiAvatar.color,
			}}
		>
			{emojiAvatar.emoji}
			{children}
		</div>
	);
}
