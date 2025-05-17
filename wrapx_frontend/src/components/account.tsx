import React from 'react';
import { useAccount, useDisconnect } from 'wagmi';

export const Account: React.FC = () => {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  if (!address) {
    // 此情况理论上不应由 Account 组件处理，
    // 因为 ConnectWallet 组件会在未连接时显示连接按钮
    return null;
  }

  // 格式化地址，例如显示前6位和后4位
  const formattedAddress = `${address.slice(0, 6)}...${address.slice(address.length - 4)}`;

  return (
    <div className="account-details">
      <span className="address-display" title={address}>
        {formattedAddress}
      </span>
      <button className="disconnect-button" onClick={() => disconnect()} title="Disconnect Wallet">
        Disconnect
      </button>
    </div>
  );
};