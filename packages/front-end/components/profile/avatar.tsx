import Image from 'next/image';
import EmojiAvatar from '../emojo-avatar';
import { cn } from '@/lib/utils';
export default function ProfileAvatar({
	address,
	avatar,
	className,
}: {
	address: string;
	avatar?: string;
	className?: string;
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
				/>
			)}
		</div>
	);
}
