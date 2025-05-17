import { base } from 'viem/chains';
import { morphoApiClient } from './graphql.js';
import { GET_VAULTS_QUERY } from './queries.js';
export async function getMorphoVaults({ chainId = base.id, assetSymbol, }) {
    const data = await morphoApiClient.request(GET_VAULTS_QUERY, {
        chainId,
        assetSymbol,
    });
    return data.vaults.items;
}
