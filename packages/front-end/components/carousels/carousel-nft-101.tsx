import { useTranslation } from 'next-i18next';
import { CarouselImageScrollerItem } from './carousel-image-scroller';
import CarouselScroller from './carousel-scroller';

export default function CarouselNFT101() {
	const { t } = useTranslation('common');
	return (
		<CarouselScroller
			contents={[
				{
					image: '/nft101/what-is-nft.png',
					caption: t('What is an NFT?'),
				},
				{
					image: '/nft101/how-to-buy-nft.png',
					caption: t('How to buy an NFT?'),
				},
				{
					image: '/nft101/what-is-mintin.png',
					caption: t('What is minting?'),
				},
				{
					image: '/nft101/stay-protected-web3.png',
					caption: t('How to stay protected in Web3?'),
				},
				{
					image: '/nft101/how-to-create-nft.png',
					caption: t('How to create an NFT?'),
				},
				{
					image: '/nft101/how-to-sell-nft.png',
					caption: t('How to sell an NFT?'),
				},
				{
					image: '/nft101/what-is-crypto-wallet.png',
					caption: t('What is a crypto wallet?'),
				},
			].map((item) => {
				return {
					render(inZone) {
						return (
							<CarouselImageScrollerItem
								content={{ ...item }}
								inZone={inZone}
							/>
						);
					},
				};
			})}
		/>
	);
}
