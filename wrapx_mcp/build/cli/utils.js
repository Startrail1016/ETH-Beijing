import fs from 'fs';
import os from 'os';
import path from 'path';
export function isUuid(value) {
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(value);
}
/**
 * Validates a BIP39 mnemonic phrase
 * @param value - The mnemonic phrase to validate
 * @returns True if the mnemonic is valid, otherwise an error message
 */
export function validateMnemonic(value) {
    // Trim whitespace and normalize spaces
    const normalized = value.trim().replace(/\s+/g, ' ');
    // Check for empty input
    if (!normalized) {
        return 'Mnemonic cannot be empty';
    }
    // Split into words and check word count
    const words = normalized.split(' ');
    const validWordCounts = [12, 15, 18, 21, 24];
    if (!validWordCounts.includes(words.length)) {
        return `Invalid mnemonic length. Must contain 12, 15, 18, 21, or 24 words. Found ${words.length} words.`;
    }
    // Check for invalid characters (only letters allowed)
    if (!/^[a-zA-Z\s]+$/.test(normalized)) {
        return 'Mnemonic contains invalid characters. Only letters and spaces are allowed.';
    }
    return true;
}
export const writeRootConfig = (config) => {
    const configPath = path.join(os.homedir(), '.base-mcp');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
};
