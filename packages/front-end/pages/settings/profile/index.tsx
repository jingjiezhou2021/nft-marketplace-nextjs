import { InferGetStaticPropsType } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import SettingsLayout from '@/components/settings-layout';
import { NextPageWithLayout } from '@/pages/_app';
import { useAccount } from 'wagmi';
import { useTranslation } from 'next-i18next';
import { Store } from 'lucide-react';
import { IconEdit } from '@tabler/icons-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { emojiAvatarForAddress } from '@/lib/emojiAvatarForAddress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export const getStaticProps = async ({ locale }) => {
	return {
		props: {
			...(await serverSideTranslations(locale, ['common'])),
			// Will be passed to the page component as props
		},
		revalidate: 60,
	};
};
function FieldSet({
	title,
	comment,
	children,
	className,
}: {
	title: string;
	comment?: string;
} & React.ComponentProps<'fieldset'>) {
	return (
		<fieldset className={className}>
			<div className="flex flex-col gap-2">
				<h4 className="leading-normal text-sm font-medium">{title}</h4>
				{children}
				<p className="leading-normal text-xs text-muted-foreground">
					{comment}
				</p>
			</div>
		</fieldset>
	);
}
const Page: NextPageWithLayout = (
	_props: InferGetStaticPropsType<typeof getStaticProps>,
) => {
	const { status, address } = useAccount();
	const { t } = useTranslation('common');
	const [bannerUrl, setBannerUrl] = useState<string>();
	const [avatarUrl, setAvatarUrl] = useState<string>();
	const uploadBannerInput = useRef<HTMLInputElement>(null);
	const uploadAvatarInput = useRef<HTMLInputElement>(null);
	const emojiAvatar = emojiAvatarForAddress(address);
	if (status === 'connected') {
		return (
			<div className="w-full h-full pt-2">
				<form
					className="h-full"
					onSubmit={(e) => {
						e.preventDefault();
					}}
				>
					<div className="flex flex-col h-full">
						<div className="grow max-h-[calc(100%-36px)] overflow-y-scroll no-scrollbar">
							<button
								className="inline-flex items-center border-0 disabled:pointer-events-none disabled:opacity-40 aspect-8/3 w-full overflow-hidden rounded-t [mask-image:linear-gradient(to_bottom,black,black_calc(100%_-_theme(spacing.16)),transparent)] group relative cursor-pointer bg-black"
								onClick={() => {
									uploadBannerInput.current.click();
								}}
							>
								{bannerUrl && (
									<Image
										fill
										src={bannerUrl}
										className="opacity-60 transition-opacity duration-300 ease-out-quint group-hover:opacity-80 absolute !top-1/2 size-full -translate-y-1/2 object-cover"
										alt="account-banner"
									/>
								)}
								<IconEdit className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white"></IconEdit>
								<input
									accept="image/*"
									type="file"
									ref={uploadBannerInput}
									className="invisible"
									onChange={(e) => {
										setBannerUrl(
											URL.createObjectURL(
												e.target.files[0],
											),
										);
									}}
								></input>
							</button>
							<div className="flex flex-col mx-4 pb-4">
								<button
									className="border-0 disabled:pointer-events-none disabled:opacity-40 group relative cursor-pointer mb-[calc(-40px+theme(spacing.3))] aspect-square size-[80px] -translate-y-1/2 rounded-full overflow-hidden z-10"
									onClick={() => {
										uploadAvatarInput.current.click();
									}}
								>
									{avatarUrl ? (
										<div className="size-full bg-black">
											<Image
												fill
												src={avatarUrl}
												className="opacity-60 transition-opacity duration-300 ease-out-quint group-hover:opacity-80 absolute !top-1/2 size-full -translate-y-1/2 object-cover"
												alt="account-banner"
											/>
										</div>
									) : (
										<div
											className="size-full flex justify-center items-center text-3xl"
											style={{
												backgroundColor:
													emojiAvatar.color,
												borderColor: emojiAvatar.color,
											}}
										>
											{emojiAvatar.emoji}
											<div className="size-full absolute top-1/2 -translate-y-1/2 bg-black opacity-20 transition-opacity duration-300 ease-out-quint group-hover:opacity-40"></div>
										</div>
									)}
									<IconEdit
										className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white"
										size={16}
									></IconEdit>
									<input
										accept="image/*"
										type="file"
										ref={uploadAvatarInput}
										className="invisible"
										onChange={(e) => {
											setAvatarUrl(
												URL.createObjectURL(
													e.target.files[0],
												),
											);
										}}
									></input>
								</button>
								<h3 className="font-medium leading-tight text-2xl mb-5 mt-2.5">
									{t('Edit Profile')}
								</h3>
								<div className="flex flex-col gap-2">
									<FieldSet
										title={t('Username')}
										comment={t(
											'This is your public username',
										)}
									>
										<Input className="w-full" />
									</FieldSet>
									<FieldSet title={t('Bio')}>
										<Textarea className="w-full" />
									</FieldSet>
									<FieldSet
										title="URL"
										comment={t(
											'Add a link to your website or social profile',
										)}
									>
										<Input className="w-full" />
									</FieldSet>
								</div>
							</div>
						</div>
						<div className="w-full flex justify-end">
							<Button
								type="submit"
								className="ml-auto"
							>
								{t('Save')}
							</Button>
						</div>
					</div>
				</form>
			</div>
		);
	} else if (status === 'disconnected') {
		return (
			<div className="w-full h-full flex justify-center items-center">
				<div className="text-muted-foreground">
					{t('Wallet Not Connected')}
				</div>
			</div>
		);
	}
};
Page.GetLayout = SettingsLayout;
export default Page;
