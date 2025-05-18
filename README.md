AgentBall：基于 NFT 的 AI 访问权限控制基础设施

AgentBall 是一个 Web3 公共基础设施，通过链上 NFT 实现对 AI 服务的访问控制。用户只需持有指定 NFT 即可使用 AI，无需订阅、也无需消耗代币，访问凭证可交易、可回收。

🧠 项目简介

AgentBall 通过以下流程重构 AI 使用方式：
	•	用户通过 Wrap（如 BNB）来 mint 一个 Access NFT
	•	该 NFT 即为 AI 服务的访问凭证，可在二级市场转让
	•	不再需要访问时，用户可 Unwrap NFT 取回原始资产

这种模式使得 AI 接入更灵活、更去中心化，也让访问资格具备流动性和价值承载能力。

💡 产品特性
	•	🔐 NFT 访问控制机制
所有 AI 服务都通过智能合约判断 NFT 持有情况以开启使用权限。
	•	🤖 多 AI Agent 支持
可集成 ChatGPT、Claude、Stable Diffusion，或自建 MCP Server，支持多种模型和应用。
	•	💱 Wrap / Unwrap 模块
用户用原生资产 Wrap 成 NFT，使用后可 Unwrap 取回资产或自由转让。
	•	🌉 Web3 钱包登录
使用 MetaMask、WalletConnect 等主流钱包进行身份认证和资产交互。

🚀 Demo 使用流程
	1.	选择左侧 AI Agent（可以是 Chat 模型、图像模型或 MCP Server Agent）
	2.	连接钱包，系统会检查你是否持有访问 NFT
	3.		•	如果持有 → 可直接进入对话界面
	•	如果未持有 → 引导进入 Wrap 流程 进行 mint
