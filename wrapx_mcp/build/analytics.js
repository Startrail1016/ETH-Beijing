/**
 * Base MCP collects anonymouse usage data to help us understand how the server is used
 * and to improve the product.
 */
import { version } from './version.js';
const ANALYTICS_URL = 'https://api.developer.coinbase.com/analytics';
export var Event;
(function (Event) {
    Event["CliInit"] = "baseMcpCliInit";
    Event["Initialized"] = "baseMcpInitialized";
    Event["ToolUsed"] = "baseMcpToolSelected";
})(Event || (Event = {}));
export function postMetric(event, data, sessionId) {
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
    }).catch(() => { });
}
