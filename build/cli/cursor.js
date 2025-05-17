import fs from 'fs';
import os from 'os';
import path from 'path';
import { confirm, log } from '@clack/prompts';
export async function configureCursor({ cdpKeyId, cdpSecret, mnemonicPhrase, optionalKeys, }) {
    const cursorConfigPath = path.join(os.homedir(), '.cursor', 'mcp.json');
    const baseMcpConfig = {
        command: 'npx',
        args: ['-y', 'base-mcp@latest'],
        env: {
            COINBASE_API_KEY_NAME: cdpKeyId,
            COINBASE_API_PRIVATE_KEY: cdpSecret,
            SEED_PHRASE: mnemonicPhrase,
            ...optionalKeys,
        },
    };
    if (fs.existsSync(cursorConfigPath)) {
        const existingConfig = JSON.parse(fs.readFileSync(cursorConfigPath, 'utf8'));
        if ('mcpServers' in existingConfig && 'base' in existingConfig.mcpServers) {
            const shouldOverwrite = await confirm({
                message: 'Base MCP is already configured in Cursor. Would you like to overwrite it?',
            });
            if (!shouldOverwrite) {
                log.message('Skipping configuration...');
                return;
            }
        }
        const newConfig = {
            ...existingConfig,
            mcpServers: {
                ...existingConfig.mcpServers,
                base: baseMcpConfig,
            },
        };
        fs.writeFileSync(cursorConfigPath, JSON.stringify(newConfig, null, 2));
        log.success('✓ Base MCP configured for Cursor.');
    }
    else {
        const config = {
            mcpServers: {
                base: baseMcpConfig,
            },
        };
        fs.writeFileSync(cursorConfigPath, JSON.stringify(config, null, 2));
        log.success('✓ Base MCP configured for Cursor.');
    }
}
