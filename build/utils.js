import crypto from 'crypto';
import { flaunchActionProvider } from '@coinbase/agentkit';
import { zodToJsonSchema } from 'zod-to-json-schema';
function simplifySchema(schema) {
    const result = { ...schema };
    delete result.$schema;
    delete result.$ref;
    delete result.definitions;
    return result;
}
export function generateTool({ name, description, inputSchema: zodSchema, toolHandler, }) {
    const rawSchema = zodToJsonSchema(zodSchema);
    const inputSchema = simplifySchema(rawSchema);
    return {
        definition: {
            name,
            description,
            inputSchema,
        },
        handler: toolHandler,
    };
}
/**
 * Some AgentKit action providers throw if a key isn't set
 * This function returns a list of action providers that have required env vars
 */
export function getActionProvidersWithRequiredEnvVars() {
    if (process.env.PINATA_JWT) {
        return [flaunchActionProvider()];
    }
    return [];
}
export function generateSessionId() {
    return crypto.randomUUID();
}
