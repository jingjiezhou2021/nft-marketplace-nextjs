import { CarouselImageScrollerItem } from './carousel-image-scroller';
import CarouselScroller from './carousel-scroller';

export default function CarouselFeaturedCollection() {
	return (
		<CarouselScroller
			loop
			contents={[
				{
					image: '/example2-1.avif',
					title: 'NFT Title',
					subtitle: 'Floor Price:0.14 ETH',
				},
				{
					image: '/example2-2.avif',
					title: 'NFT Title',
					subtitle: 'Floor Price:0.14 ETH',
				},
				{
					image: '/example2-3.avif',
					title: 'NFT Title',
					subtitle: 'Floor Price:0.14 ETH',
				},
				{
					image: '/example2-4.jpg',
					title: 'NFT Title',
					subtitle: 'Floor Price:0.14 ETH',
				},
				{
					image: '/example2-5.png',
					title: 'NFT Title',
					subtitle: 'Floor Price:0.14 ETH',
				},
				{
					image: '/example2-6.avif',
					title: 'NFT Title',
					subtitle: 'Floor Price:0.14 ETH',
				},
			].map((item) => {
				return {
					render(inZone) {
						return (
							<CarouselImageScrollerItem
								content={{ ...item }}
								inZone={inZone}
								shadow
							/>
						);
					},
				};
			})}
		/>
	);
}
