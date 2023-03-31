import { useMemo } from "react";
import { Toaster } from 'react-hot-toast'

import Header from "./components/Header";
import ContentRoutes from "./pages/content/Content";
import "./index.scss";
import {
  WalletProvider,
  AptosWalletAdapter,
  MartianWalletAdapter,
  PontemWalletAdapter,
  RiseWalletAdapter,
  NightlyWalletAdapter,
  FewchaWalletAdapter,
  SpikaWalletAdapter,
  //FletchWalletAdapter,
  //HyperPayWalletAdapter,
  //TokenPocketWalletAdapter,
  BitkeepWalletAdapter
} from '@manahippo/aptos-wallet-adapter';

function App() {
  const wallets = useMemo(
    () => [
      new RiseWalletAdapter(),
      new MartianWalletAdapter(),
      new AptosWalletAdapter(),
      new PontemWalletAdapter(),
      new FewchaWalletAdapter(),
      new BitkeepWalletAdapter(),
      new SpikaWalletAdapter(),
      new NightlyWalletAdapter()
      //new FletchWalletAdapter(),
      //new TokenPocketWalletAdapter(),
      //new HyperPayWalletAdapter()
    ],
    []
  );
  return (
    <WalletProvider
      wallets={wallets}
      autoConnect
      onError={(error: Error) => {
        let text = 'Unknow error';
        if (error.name === 'WalletNotReadyError') {
          text = 'Wallet not ready';
        }
        console.log(error);
      }}
    >
      <div>
        <Header />
        <section className="contentsSection">
          <ContentRoutes />
        </section>
      </div>
      <Toaster
        position="top-right"
        reverseOrder={false}
      />
    </WalletProvider>
  );
}

export default App;
