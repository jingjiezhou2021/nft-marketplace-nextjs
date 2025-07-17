import CarouselDoubleRowItemsScoller from './carousel-double-row-items-scroller';

export default function CarouselTrendingCollection() {
	return (
		<CarouselDoubleRowItemsScoller
			twinDatas={[
				[
					{
						cover: '/example4-1.avif',
						title: 'DX Terminal',
						description: '< 0.01 ETH',
					},
					{
						cover: '/example4-2.avif',
						title: 'Courtyard',
						description: '< 0.01 ETH',
					},
				],
				[
					{
						cover: '/example4-3.webp',
						title: 'Crypto Social Club',
						description: '< 0.01 ETH',
					},
					{
						cover: '/example4-4.png',
						title: 'Axie Consumable Item',
						description: '< 0.01 ETH',
					},
				],
				[
					{
						cover: '/example4-5.webp',
						title: 'Rekt Dogs',
						description: '< 0.01 ETH',
					},
					{
						cover: '/example4-6.avif',
						title: 'Polygon Ape',
						description: '< 0.01 ETH',
					},
				],
				[
					{
						cover: '/example4-7.png',
						title: 'NBA Top Shot',
						description: '< 0.01 ETH',
					},
					{
						cover: '/example4-8.png',
						title: 'Axie',
						description: '< 0.01 ETH',
					},
				],
				[
					{
						cover: '/example4-9.svg',
						title: 'Chonks',
						description: '< 0.01 ETH',
					},
					{
						cover: '/example4-10.avif',
						title: 'Axie Materials',
						description: '< 0.01 ETH',
					},
				],
			]}
		/>
	);
}
