import { getMorphoVaults } from './utils.js';
export async function getMorphoVaultsHandler(wallet, args) {
    const vaults = await getMorphoVaults({
        chainId: wallet.chain?.id,
        assetSymbol: args.assetSymbol ?? '',
    });
    return JSON.stringify(vaults);
}
