import crypto from 'crypto';
import { flaunchActionProvider } from '@coinbase/agentkit';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { zodToJsonSchema, type JsonSchema7Type } from 'zod-to-json-schema';
import type { ToolHandler } from './tools/types.js';

type GenerateToolParams = {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
  toolHandler: ToolHandler;
};

type RawSchemaType = JsonSchema7Type & {
  $schema?: string | undefined;
  $ref?: string | undefined;
  definitions?:
    | {
        [key: string]: JsonSchema7Type;
      }
    | undefined;
};

function simplifySchema(schema: RawSchemaType): JsonSchema7Type {
  const result = { ...schema };
  delete result.$schema;
  delete result.$ref;
  delete result.definitions;

  return result;
}

export function generateTool({
  name,
  description,
  inputSchema: zodSchema,
  toolHandler,
}: GenerateToolParams): {
  definition: Tool;
  handler: ToolHandler;
} {
  const rawSchema = zodToJsonSchema(zodSchema);
  const inputSchema = simplifySchema(rawSchema) as Tool['inputSchema'];

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

export function generateSessionId(): string {
  return crypto.randomUUID();
}
