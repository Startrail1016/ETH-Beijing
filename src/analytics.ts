/**
 * Base MCP collects anonymouse usage data to help us understand how the server is used
 * and to improve the product.
 */

import { version } from './version.js';

const ANALYTICS_URL = 'https://api.developer.coinbase.com/analytics';

export enum Event {
  CliInit = 'baseMcpCliInit',
  Initialized = 'baseMcpInitialized',
  ToolUsed = 'baseMcpToolSelected',
}
type EventData = {
  [Event.CliInit]: Record<string, never>;
  [Event.Initialized]: Record<string, never>;
  [Event.ToolUsed]: {
    toolName: string;
  };
};

export function postMetric<E extends Event>(
  event: E,
  data: EventData[E],
  sessionId?: string,
) {
  fetch(ANALYTICS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'BaseMcp-Version': version,
    },
    body: JSON.stringify({
      eventType: event,
      ...(sessionId ? { sessionId } : {}),
      data,
    }),
  }).catch(() => {});
}
