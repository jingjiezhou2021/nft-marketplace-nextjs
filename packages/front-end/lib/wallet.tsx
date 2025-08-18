import BraveWalletIcon from '@/public/braveWalletIcon';
import {
	CoinbaseWalletCircleColorful,
	MetaMaskColorful,
} from '@ant-design/web3-icons';

export function getWalletIcon(name?: string) {
	if (name === undefined) {
		return null;
	}
	const map = {
		['Coinbase Wallet']: <CoinbaseWalletCircleColorful />,
		['MetaMask']: <MetaMaskColorful />,
		['Brave Wallet']: <BraveWalletIcon className="size-8 mr-1" />,
	};
	return map[name];
}
