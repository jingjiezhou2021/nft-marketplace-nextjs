import { CalendarIcon } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from '@/components/ui/hover-card';
import { ReactNode } from 'react';
import { useQuery } from '@apollo/client';
import findUserProfile from '@/lib/graphql/queries/find-user-profile';
import { QueryMode } from '@/apollo/gql/graphql';
import { getAddressAbbreviation } from '@/lib/address';
import ProfileAvatar from './avatar';
import { LoadingMask, LoadingSpinner } from '../loading';
import { Badge } from '../ui/badge';
import { Address } from '@ant-design/web3';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useAccount } from 'wagmi';
import AddressBadge from '../address-badge';

export function ProfileCard({
	address,
	children,
}: {
	address: `0x${string}`;
	children: (
		dispName: string,
		isYou: boolean,
		avatar?: string | null,
	) => ReactNode;
}) {
	const { i18n } = useTranslation('common');
	const { address: userAddress } = useAccount();
	const { loading, data } = useQuery(findUserProfile, {
		variables: {
			where: {
				address: {
					equals: address,
					mode: QueryMode.Insensitive,
				},
			},
		},
		fetchPolicy: 'network-only',
		nextFetchPolicy: 'cache-first',
	});
	const dispName =
		data?.findFirstUserProfile?.username ?? getAddressAbbreviation(address);
	return (
		<HoverCard openDelay={300}>
			<HoverCardTrigger asChild>
				<Link
					className="cursor-pointer"
					href={`/profile/${address}`}
					locale={i18n.language}
				>
					{children(
						dispName,
						userAddress?.toLowerCase() === address.toLowerCase(),
						data?.findFirstUserProfile?.avatar,
					)}
				</Link>
			</HoverCardTrigger>
			<HoverCardContent className="w-64 z-[60]!">
				<Link
					className="flex gap-4 relative cursor-pointer"
					href={`/profile/${address}`}
					locale={i18n.language}
				>
					<LoadingMask
						className="flex justify-center items-center"
						loading={loading}
					>
						<LoadingSpinner />
					</LoadingMask>
					<Avatar>
						<ProfileAvatar
							className="mr-0"
							avatar={data?.findFirstUserProfile?.avatar}
							address={address}
						/>
					</Avatar>
					<div className="space-y-1 grow min-w-0">
						<h4 className="text-sm font-semibold">{dispName}</h4>
						{data?.findFirstUserProfile?.username && (
							<AddressBadge address={address} />
						)}
					</div>
				</Link>
			</HoverCardContent>
		</HoverCard>
	);
}
