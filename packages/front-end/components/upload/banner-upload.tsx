import { cn } from '@/lib/utils';
import ImageUpload from './image-upload';
import { ChangeEventHandler } from 'react';
import Image from 'next/image';
export default function BannerUpload({
	bannerUrl,
	className,
	handleChange,
}: {
	bannerUrl?: string | null;
	className?: string;
	handleChange: ChangeEventHandler<HTMLInputElement>;
}) {
	return (
		<ImageUpload
			className={cn(
				'border-0 disabled:opacity-40 aspect-8/3 w-full [mask-image:linear-gradient(to_bottom,black,black_calc(100%_-_theme(spacing.16)),transparent)] bg-black cursor-pointer',
				className,
			)}
			handleChange={handleChange}
		>
			{bannerUrl && (
				<Image
					fill
					src={bannerUrl}
					priority
					className="opacity-60 transition-opacity duration-300 ease-out-quint group-hover:opacity-80 absolute !top-1/2 size-full -translate-y-1/2 object-cover"
					alt="account-banner"
				/>
			)}
		</ImageUpload>
	);
}
