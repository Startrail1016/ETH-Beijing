import { WagmiProvider } from "wagmi";
import HomePage from "./pages/HomePage"; // 导入 HomePage
import { config } from "./config";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './styles/HomePage.css'; // 导入全局样式，确保 body, html, #root 生效

// 2. Set up a React Query client.
const queryClient = new QueryClient()

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <HomePage />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
