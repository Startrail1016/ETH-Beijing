import React, { useState, KeyboardEvent, useRef, useEffect } from "react";
import { useAccount, useConnect, useSignMessage } from "wagmi"; // 导入 useSignMessage
import "./../styles/HomePage.css";
import { Account } from "../components/account";
import { AddServiceModal, RegisterNftFormData } from '../components/AddServiceModal'; // 导入模态框组件和类型

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
}

// Placeholder for Agent type
interface Agent {
  id: string;
  collectionAddress: string;
  baseURL: string;
  serviceName: string;
  creatorAddress: string;
  registrationDate: string;
}

const HomePage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState<boolean>(true);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { connectors, connect } = useConnect();
  const { address } = useAccount(); // 获取当前连接的地址
  const { signMessageAsync } = useSignMessage(); // 获取签名函数

  const [isModalOpen, setIsModalOpen] = useState(false);

  // useEffect Hook 来获取 Agents
  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoadingAgents(true);
      setAgentError(null);
      try {
        // 假设你的后端 API 端点是 /api/agents
        // 请根据你的实际后端 API 地址进行修改
        const response = await fetch('/api/registered-nfts');
        if (!response.ok) {
          throw new Error(`获取 Agents 失败: ${response.statusText}`);
        }
        const data: Agent[] = await response.json();
        for (const agent of data) {
          agent.id = `${agent.collectionAddress}}`
        }
        setAgents(data);
        // 如果获取到数据，默认选择第一个 agent
        if (data.length > 0) {
          setSelectedAgentId(data[0].id);
        } else {
          setSelectedAgentId(null); // 如果没有 agent，则不选择任何 agent
        }
      } catch (error: any) {
        console.error("获取 Agents 出错:", error);
        setAgentError(error.message || "加载 Agents 列表失败，请稍后再试。");
      } finally {
        setIsLoadingAgents(false);
      }
    };

    fetchAgents();
  }, []); // 空依赖数组表示此 effect 只在组件挂载时运行一次

  const filteredAgents = agents.filter((agent) =>
    agent.serviceName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async () => { // 修改为 async 函数
    if (inputValue.trim() === "") return;
    if (!selectedAgentId) {
      alert("请先选择一个 Agent。");
      return;
    }
    if (!address) {
      alert("请先连接钱包。");
      return;
    }

    const selectedAgent = agents.find(agent => agent.id === selectedAgentId);
    if (!selectedAgent) {
      alert("未找到选定的 Agent 信息。");
      return;
    }

    const newUserMessage: Message = {
      id: Date.now().toString() + "-user",
      text: inputValue,
      sender: "user",
    };
    setMessages((prevMessages) => [...prevMessages, newUserMessage]);
    const currentInput = inputValue; // 保存当前输入值，因为 inputValue 状态会被清空
    setInputValue(""); // 清空输入框

    try {
      // 1. 准备要发送给 Agent 的数据
      const agentPayload = { content: currentInput };

      // 2. 准备要签名的消息
      // 确保签名内容能唯一确定本次请求的关键信息
      const messageToSign = JSON.stringify({
        data: agentPayload, // 发送给 agent 的具体数据
        nftCollectionAddress: selectedAgent.collectionAddress,
        reqAddress: address, // 请求者地址，用于后端校验签名者
      });

      // 3. 用户签名消息
      const signature = await signMessageAsync({ message: messageToSign });

      // 4. 准备发送到后端 /api/forward-to-agent 的数据
      const forwardRequestBody = {
        data: agentPayload, // 这个 data 会被转发给 Agent 的 baseURL
        nftCollectionAddress: selectedAgent.collectionAddress,
        reqAddress: address,
        signature: signature,
      };
      console.log(forwardRequestBody)

      // 5. 调用后端 API
      const response = await fetch('/api/forward-to-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forwardRequestBody)
      });

      if (response.ok) {
        const result = await response.json(); // 假设后端返回 { reply: "AI的回复" }
        const aiResponse: Message = {
          id: Date.now().toString() + "-ai",
          text: result.response || "AI 没有返回有效回复。", // 根据实际返回结构调整
          sender: "ai",
        };
        setMessages((prevMessages) => [...prevMessages, aiResponse]);
      } else {
        const errorResult = await response.json();
        console.error('调用后端 API 失败:', errorResult);
        alert(`获取 AI 回复失败: ${errorResult.message || response.statusText}`);
        // 将用户失败的消息重新加回输入框，或者保留在消息列表并标记失败
        setMessages((prevMessages) => prevMessages.slice(0, -1)); // 移除乐观更新的用户消息
        setInputValue(currentInput); // 将输入内容放回输入框
      }
    } catch (error: any) {
      console.error('签名或请求后端出错:', error);
      // Wagmi 的 signMessageAsync 可能会因为用户拒绝签名而抛出错误
      if (error.message && error.message.includes('User rejected the request')) {
        alert('用户取消了签名操作。');
      } else {
        alert(`请求处理失败: ${error.message || '请查看控制台获取详情。'}`);
      }
      setMessages((prevMessages) => prevMessages.slice(0, -1)); // 移除乐观更新的用户消息
      setInputValue(currentInput); // 将输入内容放回输入框
    }
  };

  const handleKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      // Send on Enter, allow Shift+Enter for newline
      event.preventDefault(); // Prevent default Enter behavior (like form submission or newline in some inputs)
      handleSendMessage();
    }
  };

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgentId(agentId);
    // Optionally, clear messages or load agent-specific history
    setMessages([]);
    console.log(`Selected agent: ${agentId}`);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleAddServiceSubmit = async (data: RegisterNftFormData) => {
    console.log("表单提交数据:", data);
    handleCloseModal(); // 关闭模态框
  };

  function ConnectWallet() {
    const { isConnected } = useAccount();
    if (isConnected) return <Account />;
    return (
      <button
        className="connect-wallet-button"
        onClick={() => connect({ connector: connectors[0] })}
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <div className="chat-container">
      <div className="sidebar">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索 Agent..."
          style={{
            marginBottom: "10px",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #444",
            backgroundColor: "#343541",
            color: "#fff",
          }}
        />
        <div className="agent-list-container">
          {isLoadingAgents && <div className="sidebar-item">正在加载 Agents...</div>}
          {agentError && <div className="sidebar-item error-message">{agentError}</div>}
          {!isLoadingAgents && !agentError && filteredAgents.length === 0 && (
            <div className="sidebar-item">未找到 Agents。</div>
          )}
          {!isLoadingAgents && !agentError && filteredAgents.map((agent) => (
            <div
              key={agent.id}
              className={`sidebar-item ${
                selectedAgentId === agent.id ? "active" : ""
              }`}
              onClick={() => handleSelectAgent(agent.id)}
            >
              {agent.serviceName}
            </div>
          ))}
        </div>
        {/* 添加服务按钮现在位于 agent-list-container 外部 */}
        <button 
          className="add-service-button" 
          onClick={handleOpenModal} // 修改 onClick 事件
        >
          添加 Agent
        </button>
      </div>
      <div className="main-content">
        <div className="top-bar">
          <div className="top-bar-title">WrapX广场</div>
          <div className="top-bar-actions">
            <ConnectWallet />
          </div>
        </div>
        <div className="chat-messages">
          {messages.map((msg) => (
            <div key={msg.id} className={`message ${msg.sender}`}>
              <p>{msg.text}</p>{" "}
              {/* Consider using a markdown renderer here for rich text */}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="chat-input-area">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="向选定的 Agent 发送消息..."
          />
          <button onClick={handleSendMessage} title="发送">
            {/* Placeholder for send icon, e.g., SVG or FontAwesome */}
            &gt;
          </button>
        </div>
      </div>
      {/* 渲染模态框组件 */}
      <AddServiceModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        onSubmit={handleAddServiceSubmit} 
      />
    </div>
  );
};

export default HomePage;
