import fs from 'fs';
import os from 'os';
import path from 'path';
import { confirm, log } from '@clack/prompts';
/**
 * Configures Base MCP server for Claude Desktop.
 */
export async function configureClaude({ cdpKeyId, cdpSecret, mnemonicPhrase, optionalKeys, }) {
    const claudeConfigPath = path.join(os.homedir(), 'Library', 'Application Support', 'Claude', 'claude_desktop_config.json');
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
    if (fs.existsSync(claudeConfigPath)) {
        const existingConfig = JSON.parse(fs.readFileSync(claudeConfigPath, 'utf8'));
        if ('mcpServers' in existingConfig && 'base' in existingConfig.mcpServers) {
            const shouldOverwrite = await confirm({
                message: 'Base MCP is already configured in Claude Desktop. Would you like to overwrite it?',
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
        fs.writeFileSync(claudeConfigPath, JSON.stringify(newConfig, null, 2));
        log.success('✓ Base MCP configured for Claude Desktop.');
    }
    else {
        const config = {
            mcpServers: {
                base: baseMcpConfig,
            },
        };
        fs.writeFileSync(claudeConfigPath, JSON.stringify(config, null, 2));
        log.success('✓ Base MCP configured for Claude Desktop.');
    }
}
