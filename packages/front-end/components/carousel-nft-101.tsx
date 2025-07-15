import CarouselImageScroller from './carousel-image-scroller';

export default function CarouselNFT101() {
	return (
		<CarouselImageScroller
			contents={[
				{
					image: '/nft101/what-is-nft.png',
					caption: 'What is an NFT?',
				},
				{
					image: '/nft101/how-to-buy-nft.png',
					caption: 'How to buy an NFT?',
				},
				{
					image: '/nft101/what-is-mintin.png',
					caption: 'What is minting?',
				},
				{
					image: '/nft101/stay-protected-web3.png',
					caption: 'How to stay protected in Web3?',
				},
				{
					image: '/nft101/how-to-create-nft.png',
					caption: 'How to create an NFT?',
				},
				{
					image: '/nft101/how-to-sell-nft.png',
					caption: 'How to sell an NFT?',
				},
				{
					image: '/nft101/what-is-crypto-wallet.png',
					caption: 'What is a crypto wallet?',
				},
			]}
		/>
	);
}
