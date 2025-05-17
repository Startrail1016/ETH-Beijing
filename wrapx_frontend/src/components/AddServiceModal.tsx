import React, { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import './../styles/HomePage.css'; // 我们将把模态框样式也放在 HomePage.css 中

export interface RegisterNftFormData {
  collectionAddress: string;
  baseURL: string;
  serviceName: string;
  creatorAddress: string;
}

interface AddServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RegisterNftFormData) => void;
}

export const AddServiceModal: React.FC<AddServiceModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [collectionAddress, setCollectionAddress] = useState('');
  const [baseURL, setBaseURL] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [creatorAddress, setCreatorAddress] = useState('');
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage(); // 用于签名消息

  useEffect(() => {
    // 如果模态框打开，重置表单字段
    if (isOpen) {
      setCollectionAddress('');
      setBaseURL('');
      setServiceName('');
      setCreatorAddress('');
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleAddServiceSubmit = async (data: RegisterNftFormData) => {
    if (!address) {
      alert('请先连接钱包。');
      return;
    }

    // 确保表单中的 creatorAddress 与连接的钱包地址一致
    // 这是一个好习惯，但根据您的具体需求，此步骤可选
    if (data.creatorAddress.toLowerCase() !== address.toLowerCase()) {
      alert('创建者地址与当前连接的钱包地址不符。请检查表单或切换钱包账户。');
      return;
    }

    try {
      // 1. 准备要签名的消息
      // 我们将对表单数据进行签名，以证明所有权/意图
      // 确保消息对用户是可读的，或者至少是确定性的
      const messageToSign = JSON.stringify({
        collectionAddress: data.collectionAddress,
        baseURL: data.baseURL,
        serviceName: data.serviceName,
        creatorAddress: data.creatorAddress, // 确保签名的是用户输入的创建者地址
      });

      // 2. 用户签名消息
      const signature = await signMessageAsync({ message: messageToSign });
      console.log("获得签名:", signature);

      // 3. 准备发送到后端的数据，包含签名
      const payload = {
        ...data,
        signature: signature,
      };

      // 4. 调用后端 API
      const response = await fetch('/api/register-nft', { // 使用后端的确切地址
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('服务注册成功:', result);
        alert('服务注册成功！');
      } else {
        const errorResult = await response.json(); // 或者 response.text()
        console.error('服务注册失败:', errorResult);
        alert(`服务注册失败: ${errorResult.message || '请查看控制台获取详情。'}`);
      }
    } catch (error: any) {
      console.error('签名或请求后端出错:', error);
      // Wagmi 的 signMessageAsync 可能会因为用户拒绝签名而抛出错误
      if (error.message && error.message.includes('User rejected the request')) {
        alert('用户取消了签名操作。');
      } else {
        alert(`请求处理失败: ${error.message || '请查看控制台获取详情。'}`);
      }
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!collectionAddress || !baseURL || !serviceName || !creatorAddress) {
      alert('所有字段均为必填项！'); // 简单的客户端验证
      return;
    }
    const data = { collectionAddress, baseURL, serviceName, creatorAddress };
    handleAddServiceSubmit(data);
    onSubmit(data);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>添加新服务</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="collectionAddress">NFT Collection 地址:</label>
            <input
              type="text"
              id="collectionAddress"
              value={collectionAddress}
              onChange={(e) => setCollectionAddress(e.target.value)}
              placeholder="例如: 0x123..."
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="baseURL">服务 Base URL:</label>
            <input
              type="url"
              id="baseURL"
              value={baseURL}
              onChange={(e) => setBaseURL(e.target.value)}
              placeholder="例如: https://api.example.com/nft-service"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="serviceName">服务名称:</label>
            <input
              type="text"
              id="serviceName"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              placeholder="例如: 我的NFT工具"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="creatorAddress">创建者地址:</label>
            <input
              type="text"
              id="creatorAddress"
              value={creatorAddress}
              onChange={(e) => setCreatorAddress(e.target.value)}
              placeholder="例如: 0xabc... (用于签名验证)"
              required
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="modal-button primary">确定添加</button>
            <button type="button" className="modal-button secondary" onClick={onClose}>取消</button>
          </div>
        </form>
      </div>
    </div>
  );
};