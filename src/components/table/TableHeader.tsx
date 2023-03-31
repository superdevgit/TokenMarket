import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useWallet } from "@manahippo/aptos-wallet-adapter";

import "./tableStyles.scss";
import { ReactComponent as ListIcon } from "../../icons/table-header-icons/list_icon.svg";
import { ReactComponent as ProfileIcon } from "../../icons/table-header-icons/profile_icon.svg";
import { ReactComponent as RecentsIcon } from "../../icons/table-header-icons/recents_icon.svg";
import { ReactComponent as AddTokenIcon } from "../../icons/table-header-icons/list_plus.svg";
import { ReactComponent as SearchIcon } from "../../icons/table-header-icons/search_icon.svg";
import TokenListModal from "../modal/TokenListModal";
import { connected } from "process";
import { toast } from "react-hot-toast";

export enum ETabOptions {
  TOKEN_LISTING = "",
  MY_ORDERS = "my-orders",
  RECENT_TRADES = "recent-trades",
}
export default function TableHeader({ searchToken, handleSearchToken }: any) {
  const { connected } = useWallet()
  const [activeTab, handleActiveTab] = useState(ETabOptions.TOKEN_LISTING);
  const history = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);

  const handleShowModal = () => {
    if (connected) {
      setShowModal(true)
    } else {
      toast.error(`Please connect your wallet`)
    }
  }

  useEffect(() => {
    const tab = location.pathname.split("/")[1];
    handleActiveTab(tab as ETabOptions);
  }, [location.pathname]);

  return (
    <>
      <div className="tableHeaderContainer mr-2 flex justify-between items-center">
        <div className="headerNavs flex">
          <button
            onClick={() => {
              history(`/${ETabOptions.TOKEN_LISTING}`);
            }}
            className={`text-white flex justify-center items-center ${activeTab === ETabOptions.TOKEN_LISTING ? "activeTab" : ""
              }`}
          >
            <ListIcon />
            Token Listings
          </button>
          <button
            onClick={() => {
              history(`/${ETabOptions.MY_ORDERS}`);
            }}
            className={`text-white flex justify-center items-center ${activeTab === ETabOptions.MY_ORDERS ? "activeTab" : ""
              }`}
          >
            <ProfileIcon />
            My Orders
          </button>
          <button
            onClick={() => {
              history(`/${ETabOptions.RECENT_TRADES}`);
            }}
            className={`text-white flex justify-center items-center ${activeTab === ETabOptions.RECENT_TRADES ? "activeTab" : ""
              }`}
          >
            <RecentsIcon />
            Recent Trades
          </button>
        </div>
        <div className="flex justify-between items-center relative">
          <button
            onClick={handleShowModal}
            className="text-white flex justify-center items-center listTokenButton"
          >
            List Token <AddTokenIcon className="ml-1" />
          </button>
          <input
            className="tableSearch"
            placeholder="Search Token"
            type="text"
            value={searchToken}
            onChange={(e) => handleSearchToken(e.target.value)}
          />
          <SearchIcon className="searchIcon" />
        </div>
      </div>
      <TokenListModal showModal={showModal} setShowModal={setShowModal} />
    </>
  );
}
