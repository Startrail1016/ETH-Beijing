# AgentBall Dev Log

本项目为ETH-Beijing相关开发仓库。

## 前端功能

🌐 页面一：主页（模型选择 + 钱包连接）

功能
	1.	顶部按钮：连接钱包（MetaMask）
	2.	中间区域：展示几个模型选项（如 ChatGPT、Claude）
	•	模型名称
	•	简介
	•	Wrap 所需资产（比如 0.1 BNB）
	•	“进入”按钮

⸻

🧾 点击“进入”后的逻辑流程
	1.	检查钱包地址是否持有该模型的 NFT
➤ 合约调用：balanceOf(user, modelPoolNFTAddress)
	2.	如果持有：
	•	进入 “AI 聊天页面”
	3.	如果没有：
	•	弹出提示：您未持有使用权限 NFT，请前往 Wrap 页面获取
	•	提供一个按钮 前往 Wrap 页面，跳转到 /wrap?model=chatgpt 页面

⸻

💬 页面二：AI 聊天页面

功能
	•	显示当前模型名称（如 ChatGPT）
	•	聊天框 + 发送按钮
	•	聊天记录展示区域
	•	每次提问调用后端接口
（参数：地址 + 模型类型 + 消息内容）

⸻

🪙 合约调用说明
	1.	钱包连接：使用 wagmi 或 ethers.js
	2.	检查 NFT 权限：使用 ERC721.balanceOf(address) 方法

⸻

🎯 最小可用版本目标（MVP）
	•	钱包能连接
	•	能展示模型池
	•	能验证是否持有对应 NFT
	•	未持有能跳转 Wrap 页面
	•	持有后能进入聊天页面
	•	聊天框能与 AI 模型对话

 ## 网页跳转WrapX介绍
Website：https://www.wrapx.ai/
Official X:https://x.com/wrap_x
Docs:https://docs.wrapx.ai/
![QQ20250507-231000](https://github.com/user-attachments/assets/a2316f84-0334-405e-8c34-2760687161dc)

WrapX 是一个无许可的链上流动性协议，允许用户将原生资产进行包装成 WToken，生成基于使用情况动态变化的用户与协议关系的表示。

WToken 是通过包装过程创建的非同质化代币（NFT），代表对集成了 WrapX 的平台上特定服务或功能的代币化访问权限。其价值受到市场需求和包装资产数量等因素的影响。持有 WToken 的用户不仅能够享有平台的专属功能，还能随着包装资产的增加，享受 WToken 价值潜在的升值收益。
