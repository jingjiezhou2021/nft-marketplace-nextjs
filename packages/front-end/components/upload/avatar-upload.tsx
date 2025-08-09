import { ChangeEventHandler } from 'react';
import ImageUpload from './image-upload';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import EmojiAvatar from '../emojo-avatar';
export default function AvatarUpload({
	className,
	handleChange,
	avatarUrl,
	address,
}: {
	className?: string;
	handleChange: ChangeEventHandler<HTMLInputElement>;
	avatarUrl: string | null;
	address: string;
}) {
	return (
		<ImageUpload
			handleChange={handleChange}
			className={cn(
				'border-0 disabled:pointer-events-none disabled:opacity-40 mb-[calc(-40px+theme(spacing.3))] aspect-square size-[80px] -translate-y-1/2 rounded-full z-10 cursor-pointer',
				className,
			)}
		>
			{avatarUrl ? (
				<div className="size-full bg-black relative">
					<Image
						fill
						src={avatarUrl}
						className="opacity-60 transition-opacity duration-300 ease-out-quint group-hover:opacity-80 absolute !top-1/2 size-full -translate-y-1/2 object-cover"
						alt="account-banner"
					/>
				</div>
			) : (
				<EmojiAvatar
					address={address}
					className="size-full"
				>
					<div className="size-full absolute top-1/2 -translate-y-1/2 bg-black opacity-20 transition-opacity duration-300 ease-out-quint group-hover:opacity-40"></div>
				</EmojiAvatar>
			)}
		</ImageUpload>
	);
}
