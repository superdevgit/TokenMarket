import { Link } from "react-router-dom";
import { AptosWalletName, useWallet } from "@manahippo/aptos-wallet-adapter";
import { ReactComponent as HomeIcon } from "../icons/nav-icons/home_icon.svg";
import { ReactComponent as GlobeIcon } from "../icons/nav-icons/globe_icon.svg";
import { ReactComponent as EmbersLogo } from "../icons/nav-icons/embers_logo.svg";
import "./headerStyles.scss";
import { beautifyAddress } from "../helpers/aptos";
import CONFIG from "../config";

export default function Header() {
  const { connect, disconnect, connected, account } = useWallet();

  const handleClick = async () => {
    if (connected) {
      await disconnect();
    }
    else {
      await connect(AptosWalletName);
    }
  };

  return (
    <header
      className="fixed w-full z-30 md:bg-opacity-90 transition duration-300 ease-in-out 
        bg-white backdrop-blur-sm shadow-lg"
      style={{ background: "#F6A792" }}
    >
      <div className="mx-auto px-5 sm:px-6 headerItemsContainer flex items-center justify-between py-2">
        <div className="flex-shrink-0 mr-4">
          <button
            style={{ color: "#F8F1DB", background: "#414654" }}
            className="font-bold  pr-2.5  rounded flex justify-center items-center"
          >
            <HomeIcon className="m-1.5 p-1" />
            Elements
          </button>
        </div>
        <div className="emberLogo">
          <Link to="/">
            <EmbersLogo />
          </Link>
        </div>
        <div className="wallet-group" >
          {
            account?.address === CONFIG.ADMIN && <Link to={'/admin'}  >Admin</Link>
          }
          <button
            style={{ color: "#F8F1DB", background: "#414654" }}
            className="hover:bg-slate-600 font-bold py-1 pl-2.5 rounded flex justify-center items-center connect-wallet-button"
            onClick={handleClick}
          >
            {connected && account ? beautifyAddress(account!.address!.toString()) : 'Connect Wallet'}
            <GlobeIcon className="m-1 p-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
