import Fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify';
import { Server, IncomingMessage, ServerResponse } from 'http';
import path from 'path'; // 导入 path模块
import fs from 'fs'; // 导入 fs模块
import axios from 'axios'; // 导入 axios
import { verifyMessage } from 'viem'; // 从 viem 导入 verifyMessage

// 确保 logs 目录存在
const logsDir = path.join(__dirname, '..', 'logs'); // 定位到项目根目录下的 logs
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// 确保 data 目录存在，用于存储 JSON 数据
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 定义数据文件路径
const nftDataPath = path.join(dataDir, 'registered_nfts.json');

// 创建 Fastify 实例
const server: FastifyInstance<Server, IncomingMessage, ServerResponse> = Fastify({
  logger: {
    level: 'info', // 记录 info 及以上级别的日志
    transport: {
      targets: [
        {
          target: 'pino-pretty', // 输出到控制台，并美化
          options: {
            translateTime: 'SYS:standard', // 'yyyy-mm-dd HH:MM:ss' 格式
            ignore: 'pid,hostname', // 忽略 pid 和 hostname
            colorize: true, // 颜色化输出
          },
          level: 'info' // 控制台也记录 info 及以上级别
        },
        {
          target: 'pino/file', // 输出到文件
          options: {
            destination: path.join(logsDir, 'app.log'), // 日志文件路径
            mkdir: true, // 如果目录不存在，则创建它 (pino/file v7+ 支持)
          },
          level: 'info' // 文件记录 info 及以上级别
        }
      ]
    }
  }
});


// 定义 /ping GET 路由
server.get('/ping', async (request, reply) => { // 移除了 pingOpts
  request.log.info('Ping route was called');
  return { message: 'pong' };
});

// 定义注册 NFT 接口的请求体接口
interface RegisterNftRequestBody {
  collectionAddress: string;
  baseURL: string;
  serviceName: string;
  creatorAddress: string;
  signature?: string; // 由 NFT Collection 创建者签名的数据
  // 添加一个可选的 registrationDate 字段，因为我们在读取时它可能存在
  registrationDate?: string;
}

// 定义 /register-nft POST 路由
// 我们将类型直接用于 request.body
server.post<{ Body: RegisterNftRequestBody }>('/register-nft', async (request, reply) => {
  const { collectionAddress, baseURL, serviceName, signature, creatorAddress } = request.body;

  // 基本的日志记录
  request.log.info(`Register NFT request received:
    Collection Address: ${collectionAddress}
    Base URL: ${baseURL}
    Service Name: ${serviceName}
    Creator Address: ${creatorAddress}`);

  // 检查基本字段是否存在 (轻量级验证)
  if (!collectionAddress || !baseURL || !serviceName || !signature || !creatorAddress) {
    reply.status(400).send({ message: 'Missing required fields in request body.' });
    return;
  }

  try {
    let existingNfts: RegisterNftRequestBody[] = [];
    // 检查文件是否存在，如果存在则读取
    if (fs.existsSync(nftDataPath)) {
      const fileContent = fs.readFileSync(nftDataPath, 'utf-8');
      if (fileContent) { // 确保文件内容不为空
        existingNfts = JSON.parse(fileContent);
      }
    }

    // 检查 collectionAddress 是否已存在
    const isDuplicate = existingNfts.some(nft => nft.collectionAddress === collectionAddress);
    if (isDuplicate) {
      request.log.warn(`Attempt to register duplicate collectionAddress: ${collectionAddress}`);
      return reply.status(409).send({ message: `Collection address ${collectionAddress} is already registered.` });
    }

    const newNftEntry = {
      collectionAddress,
      baseURL,
      serviceName,
      creatorAddress,
      registrationDate: new Date().toISOString(),
      // signature 字段通常不在保存的数据中，因为它用于验证请求，而不是服务本身的属性
      // 如果需要保存签名，可以在这里添加
    };

    // 追加新条目
    existingNfts.push(newNftEntry);

    // 写回文件
    fs.writeFileSync(nftDataPath, JSON.stringify(existingNfts, null, 2), 'utf-8');
    
    request.log.info(`NFT data for ${collectionAddress} saved to ${nftDataPath}`);

    return reply.status(200).send({
      message: 'NFT registration successful and data saved.',
      data: newNftEntry
    });

  } catch (error) {
    request.log.error(`Error processing NFT registration: ${error}`);
    // 断言错误类型以访问 message 属性
    let errorMessage = 'Failed to process NFT registration due to an internal error.';
    if (error instanceof Error) {
        errorMessage = `Failed to process NFT registration: ${error.message}`;
    }
    return reply.status(500).send({ message: errorMessage });
  }
});

// 新增：定义获取已注册 NFT 列表的 GET 路由
server.get('/registered-nfts', async (request, reply) => {
  request.log.info('Request to fetch registered NFTs received.');
  try {
    // 检查数据文件是否存在
    if (fs.existsSync(nftDataPath)) {
      const fileContent = fs.readFileSync(nftDataPath, 'utf-8');
      if (fileContent) {
        const nfts = JSON.parse(fileContent);
        return reply.status(200).send(nfts);
      } else {
        // 文件存在但为空
        return reply.status(200).send([]); // 返回空数组
      }
    } else {
      // 文件不存在
      request.log.info('NFT data file not found, returning empty list.');
      return reply.status(200).send([]); // 文件不存在也返回空数组
    }
  } catch (error) {
    request.log.error(`Error fetching registered NFTs: ${error}`);
    let errorMessage = 'Failed to fetch registered NFTs due to an internal error.';
    if (error instanceof Error) {
        errorMessage = `Failed to fetch registered NFTs: ${error.message}`;
    }
    return reply.status(500).send({ message: errorMessage });
  }
});


// 定义转发到 Agent 后端的接口请求体
interface ForwardRequestBody {
  data: any; // 实际要发送给 Agent 后端的数据
  nftCollectionAddress: string; // 用于查找 Agent 的 baseURL
  reqAddress: `0x${string}`; // 发起请求并签名的用户地址
  signature: `0x${string}`; // 对其他字段组合进行签名的结果
}

// 定义转发到 Agent 后端的 POST 路由
server.post<{ Body: ForwardRequestBody }>('/forward-to-agent', async (request, reply) => {
  const { data, nftCollectionAddress, reqAddress, signature } = request.body;

  request.log.info(`Forward request received for NFT Collection: ${nftCollectionAddress} from address: ${reqAddress}`);

  // 1. 验证请求体字段
  if (!data || !nftCollectionAddress || !reqAddress || !signature) {
    return reply.status(400).send({ message: 'Missing required fields: data, nftCollectionAddress, reqAddress, or signature.' });
  }

  try {
    // 2. 构造用于签名验证的消息
    // 客户端签名时应使用相同的结构和顺序
    // 我们假设客户端对以下对象的 JSON 字符串进行了签名：
    // { data: ..., nftCollectionAddress: ..., reqAddress: ... }
    // 注意：如果 data 本身是一个复杂对象，确保客户端签名的是其确定的字符串表示形式。
    // 为了简单和确定性，通常会对一个包含所有相关字段的对象进行签名。
    const messageToVerify = JSON.stringify({
      data, // 确保客户端签名时 data 的序列化方式与此处一致
      nftCollectionAddress,
      reqAddress
    });

    request.log.info('Message to verify:', messageToVerify); // 打印出要验证的消息，以便客户端可以确认

    // 3. 验证签名
    const isValidSignature = await verifyMessage({
      address: reqAddress,
      message: messageToVerify,
      signature: signature,
    });

    if (!isValidSignature) {
      request.log.warn(`Invalid signature for forward request. Address: ${reqAddress}, NFT Collection: ${nftCollectionAddress}`);
      return reply.status(401).send({ message: 'Invalid signature.' });
    }

    request.log.info(`Signature verified successfully for address: ${reqAddress}`);

    // 4. 查找 Agent 的 baseURL
    let existingNfts: RegisterNftRequestBody[] = [];
    if (fs.existsSync(nftDataPath)) {
      const fileContent = fs.readFileSync(nftDataPath, 'utf-8');
      if (fileContent) {
        existingNfts = JSON.parse(fileContent);
      }
    }

    const agentService = existingNfts.find(nft => nft.collectionAddress === nftCollectionAddress);

    if (!agentService || !agentService.baseURL) {
      request.log.warn(`Agent service not found or baseURL missing for NFT Collection: ${nftCollectionAddress}`);
      return reply.status(404).send({ message: `Agent service with collection address ${nftCollectionAddress} not found or baseURL is not configured.` });
    }

    const agentBaseURL = agentService.baseURL;
    request.log.info(`Forwarding data to Agent at baseURL: ${agentBaseURL}`);

    // 5. 使用 axios 将 data 转发给 Agent 的实际后端地址
    // 假设 Agent 后端期望接收 POST 请求，并且内容类型是 application/json
    // 这里的 data 是从原始请求中获取的 data 字段
    const agentResponse = await axios.post(agentBaseURL, data, {
      headers: {
        'Content-Type': 'application/json',
        // 您可能还需要转发其他头部信息，或添加特定的认证头部（如果 Agent 后端需要）
      },
      // 如果 Agent 后端响应时间可能较长，可以设置超时
      // timeout: 5000, // 5 seconds
    });

    request.log.info(`Successfully forwarded data to Agent. Status: ${agentResponse.status}`);

    // 6. 将 Agent 后端的响应返回给原始调用者
    // 我们将 Agent 的状态码和数据都返回
    return reply.status(agentResponse.status).send(agentResponse.data);

  } catch (error: any) {
    request.log.error(`Error processing forward request: ${error.message}`);
    if (axios.isAxiosError(error)) {
      // 如果是 Axios 错误 (例如网络错误，或 Agent 后端返回错误状态码)
      request.log.error(`Axios error while forwarding to agent: ${error.response?.status} - ${JSON.stringify(error.response?.data)}`);
      if (error.response) {
        // 如果 Agent 后端返回了响应，则将该响应的状态码和数据返回
        return reply.status(error.response.status).send(error.response.data);
      } else if (error.request) {
        // 请求已发出但没有收到响应
        return reply.status(503).send({ message: 'Service unavailable: No response from agent backend.' });
      } else {
        // 设置请求时发生错误
        return reply.status(500).send({ message: 'Internal server error while preparing agent request.' });
      }
    }
    // 其他类型的错误 (例如签名验证内部错误，文件读取错误等)
    return reply.status(500).send({ message: 'Internal server error while processing your request.' });
  }
});


// 启动服务器的函数
const start = async () => {
  try {
    // 监听端口 3001，主机 0.0.0.0 (允许外部访问)
    // 前端通常运行在 3000 端口，所以后端使用 3001 避免冲突
    await server.listen({ port: 3001, host: '0.0.0.0' });

    // Fastify v3+ server.listen 返回一个字符串地址
    // server.log.info(`Server listening on ${server.server.address()}`);
    // 对于 Fastify v4+, server.server.address() 返回 AddressInfo | string | null
    // 我们可以在 server.ready() 之后或者 server.listen() 的回调中获取地址
    // 或者直接在日志中打印配置的端口
    // server.log.info(`Server listening on port 3001`); // 这条日志会被新的 logger 配置处理

  } catch (err) {
    server.log.error(err); // 这条错误日志也会被新的 logger 配置处理并持久化
    process.exit(1);
  }
};

// 调用启动函数
start();