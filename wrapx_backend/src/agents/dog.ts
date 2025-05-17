import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

// 建议从环境变量中获取 API Key 和 URL
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
// 您可以设置一个默认的 DeepSeek API URL，或者也通过环境变量配置
const DEEPSEEK_API_URL =
    process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/chat/completions";

if (!DEEPSEEK_API_KEY) {
    console.error("DEEPSEEK_API_KEY is not set in environment variables.");
    // 退出程序
    process.exit(1);
}

interface DeepSeekRequestBody {
    content: string;
}

// DeepSeek API 请求体通常需要一个消息数组
interface DeepSeekMessage {
    role: "user" | "assistant" | "system";
    content: string;
}

interface DeepSeekApiPayload {
    messages: DeepSeekMessage[];
    model: string;
    // 根据 DeepSeek API 文档，这里可能还有其他参数
    // stream?: boolean; // 如果 DeepSeek 支持流式响应
}

const systemPrompt = `
你是一直小狗，是一只很乖很乖的小狗。你会在每句话的最后加上汪。并且会给询问你的人出一些很友善的主意。
`;
async function registerDeepSeekAgentRoutes(server: FastifyInstance) {
    server.post(
        "/chat", // 定义 POST 接口路径
        async (
            request: FastifyRequest<{ Body: DeepSeekRequestBody }>,
            reply: FastifyReply
        ) => {
            if (!DEEPSEEK_API_KEY) {
                server.log.error(
                    "DEEPSEEK_API_KEY is not set in environment variables."
                );
                return reply
                    .status(500)
                    .send({ message: "DeepSeek API key not configured." });
            }

            const { content } = request.body;
            try {
                const payload: DeepSeekApiPayload = {
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: content },
                    ],
                    model: "deepseek-chat",
                };

                server.log.info(
                    `Sending request to DeepSeek API (URL: ${DEEPSEEK_API_URL}) with prompt: "${systemPrompt}"`
                );

                const response = await axios.post(DEEPSEEK_API_URL, payload, {
                    headers: {
                        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    timeout: 30000, // 设置超时时间，例如30秒
                });

                server.log.info("Received response from DeepSeek API.");

                // 假设 DeepSeek API 响应结构中，答案在 response.data.choices[0].message.content
                // 请根据实际的 DeepSeek API 文档调整此处的路径
                if (
                    response.data &&
                    response.data.choices &&
                    response.data.choices.length > 0 &&
                    response.data.choices[0].message &&
                    response.data.choices[0].message.content
                ) {
                    return reply.send({
                        success: true,
                        response: response.data.choices[0].message.content,
                    });
                } else {
                    server.log.error(
                        "Unexpected response structure from DeepSeek API:",
                        response.data
                    );
                    return reply.status(500).send({
                        message: "Unexpected response structure from DeepSeek API.",
                    });
                }
            } catch (error: any) {
                server.log.error("Error calling DeepSeek API:", error.message);
                if (error.response) {
                    // API 返回了错误状态码 (例如 4xx, 5xx)
                    server.log.error(
                        "DeepSeek API Error Response Data:",
                        error.response.data
                    );
                    server.log.error(
                        "DeepSeek API Error Response Status:",
                        error.response.status
                    );
                    return reply.status(error.response.status || 500).send({
                        message: "Error from DeepSeek API.",
                        details: error.response.data,
                    });
                } else if (error.request) {
                    // 请求已发出但没有收到响应 (例如网络问题或超时)
                    server.log.error(
                        "No response received from DeepSeek API. Request details:",
                        error.request
                    );
                    return reply
                        .status(503)
                        .send({
                            message:
                                "No response received from DeepSeek API. The service might be unavailable or request timed out.",
                        });
                } else {
                    // 设置请求时发生了一些事情，触发了错误
                    return reply.status(500).send({
                        message: "Error setting up request to DeepSeek API.",
                        details: error.message,
                    });
                }
            }
        }
    );
}

// Main function to start the standalone server
async function startStandaloneServer() {
    const server = Fastify({
        logger: {
            level: "info",
            transport: {
                target: "pino-pretty",
                options: {
                    translateTime: "SYS:standard",
                    ignore: "pid,hostname",
                    colorize: true,
                },
            },
        },
    });

    // Register the routes
    await registerDeepSeekAgentRoutes(server);

    // Define the port for the standalone agent, e.g., 3002
    const port = process.env.DEEPSEEK_AGENT_PORT
        ? parseInt(process.env.DEEPSEEK_AGENT_PORT, 10)
        : 3002;
    const host = "0.0.0.0";

    try {
        await server.listen({ port, host });
        server.log.info(
            `DeepSeek Agent server listening on http://${host}:${port}`
        );
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
}

// If this script is run directly, start the server.
if (require.main === module) {
    startStandaloneServer();
}
