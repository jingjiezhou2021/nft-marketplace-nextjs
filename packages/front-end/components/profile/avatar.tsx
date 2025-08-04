import Image from 'next/image';
import EmojiAvatar from '../emojo-avatar';
import { cn } from '@/lib/utils';
export default function ProfileAvatar({
	address,
	avatar,
	className,
	size,
}: {
	address: string;
	avatar?: string | null;
	className?: string;
	size?: number;
}) {
	return (
		<div
			className={cn(
				'cursor-pointer aspect-square size-10 rounded-full overflow-hidden relative mr-4',
				className,
			)}
		>
			{avatar ? (
				<Image
					src={new URL(
						avatar,
						process.env.NEXT_PUBLIC_SERVER_ENDPOINT,
					).toString()}
					fill
					alt="profile-avatar"
				/>
			) : (
				<EmojiAvatar
					address={address}
					className="size-full"
					size={size}
				/>
			)}
		</div>
	);
}
