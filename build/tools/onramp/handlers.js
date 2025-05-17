import { getOnrampBuyUrl } from '@coinbase/onchainkit/fund';
import { base } from 'viem/chains';
import { checkToolSupportsChain } from '../utils/index.js';
export async function getOnrampAssetsHandler(wallet, args) {
    checkToolSupportsChain({
        chainId: wallet.chain?.id,
        supportedChains: [base],
    });
    const config = await fetch(`https://api.developer.coinbase.com/onramp/v1/buy/options?country=${args.country}&subdivision=${args.subdivision}&networks=base`, {
        headers: {
            Authorization: `Bearer ${process.env.COINBASE_PUBLIC_API_KEY}`,
        },
    }).then((res) => res.json());
    return JSON.stringify(config);
}
export async function onrampHandler(wallet, args) {
    checkToolSupportsChain({
        chainId: wallet.chain?.id,
        supportedChains: [base],
    });
    const { amountUsd, assetId } = args;
    if (!process.env.COINBASE_PROJECT_ID) {
        throw new Error('COINBASE_PROJECT_ID is not set');
    }
    const address = wallet.account?.address;
    if (!address) {
        throw new Error('No address found');
    }
    const onrampUrl = getOnrampBuyUrl({
        projectId: process.env.COINBASE_PROJECT_ID,
        addresses: { [address]: ['base'] }, // Onramp only available on Base
        assets: [assetId],
        presetFiatAmount: amountUsd,
        fiatCurrency: 'USD',
        redirectUrl: '',
    });
    return onrampUrl;
}
