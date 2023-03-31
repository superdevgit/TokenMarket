import React, { useState, useEffect } from "react";
import copy from "copy-to-clipboard";
import { useWallet } from "@manahippo/aptos-wallet-adapter";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import "./modalStyles.scss";

import { hex_to_ascii } from "../../helpers/aptos";
import { ReactComponent as ModalCloseIcon } from "../../icons/modal-icons/modal_close.svg";
import { ReactComponent as TokenFavicon } from "../../icons/table-body-icons/table_row_favicon.svg";
import { ReactComponent as DiscordIcon } from "../../icons/modal-icons/discord-icon.svg";
import { ReactComponent as TwitterIcon } from "../../icons/modal-icons/twitter_icon.svg";
import { ReactComponent as GlobeIcon } from "../../icons/modal-icons/globe_icon.svg";
import { ReactComponent as CopyToClipBoard } from "../../icons/modal-icons/copy_icon.svg";
import { ReactComponent as TokenGlobe } from "../../icons/table-body-icons/token_globe.svg";
import { ReactComponent as RecentsIcon } from "../../icons/table-header-icons/recents_icon.svg";
import { ReactComponent as ListIcon } from "../../icons/table-header-icons/list_icon.svg";
import { ReactComponent as ProfileIcon } from "../../icons/table-header-icons/profile_icon.svg";

import { APTOS_DECIMAL } from "../../constants";
import { createBuyOrder, getMarketCoins } from "../../helpers/aptos";
import { ETabOptions } from "../table/TableHeader";
import Table from "../table/Table";

export default function TradeModal({
  showModal,
  setShowModal,
  columns,
  setActiveTab,
  activeTab,
  marketItemLists,
  setMarketItemLists,
  myOrderSellLists,
  myOrderBuyLists,
  setMyOrderBuyLists,
  myOrderId,
  recentTradesList,
  filterMarketTokenLists,
  setFilterMarketTokenLists,
  modalImage
}: {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  columns: { title: string; key: string }[];
  setActiveTab: React.Dispatch<React.SetStateAction<ETabOptions>>;
  activeTab: ETabOptions;
  marketItemLists: any;
  setMarketItemLists: React.Dispatch<React.SetStateAction<boolean>>;
  myOrderSellLists: any;
  myOrderBuyLists: any;
  setMyOrderBuyLists: any;
  myOrderId: any;
  recentTradesList: any;
  filterMarketTokenLists: any;
  setFilterMarketTokenLists: any;
  modalImage: any;
}) {
  const { account, signAndSubmitTransaction } = useWallet()
  const [isLoading, setLoading] = useState(false)

  const navigate = useNavigate();
  const location = useLocation();

  const [buyOrderModal, setBuyOrderModal] = useState(false)
  const [orderPrice, setOrderPrice] = useState('')
  const [orderAmount, setOrderAmount] = useState('')

  function handleTabChange(selectedTab: ETabOptions) {
    setActiveTab(selectedTab);
  }


  const handleCreateBuy = async () => {
    try {

      if (!account?.address) {
        toast.error(`Please connect your wallet`)
        return
      }
      const exist_buy = myOrderBuyLists.buy_wallets.find((item: any) => item === account?.address);
      if (exist_buy) {
        toast.error(`Already Created`)
        return
      }
      if (Number(orderAmount) <= 0) {
        toast.error(`Amount is bigger than 0`)
        return
      }

      if (Number(orderPrice) <= 0) {
        toast.error(`Price is bigger than 0`)
        return
      }
      setLoading(true)
      const module_name = await hex_to_ascii(marketItemLists?.id.module_name.toString())
      const struct_name = await hex_to_ascii(marketItemLists?.id.struct_name.toString())

      const coinAddress_name = marketItemLists?.id.account + "::" +
        module_name.substring(1) + "::" + struct_name.substring(1)

      const tx: any = await createBuyOrder(
        coinAddress_name,
        myOrderId,
        Number(orderAmount) * Math.pow(10, marketItemLists.id.decimals),
        Number(orderPrice)
      )

      const res = await signAndSubmitTransaction(tx);
      if (res) {
        toast.success(`Successfully Create Order`)
        const orderId = myOrderBuyLists.buy_wallets.findIndex((item: any) =>
          item === account?.address
        )

        const temp = myOrderBuyLists.buy_orders.map((item: any, idx: any) => {
          const res = idx === orderId ? { ...item, price: (Number(orderPrice) * APTOS_DECIMAL).toString() } : item;
          return res
        })
        setMyOrderBuyLists({ ...myOrderBuyLists, buy_orders: temp })
        setBuyOrderModal(false)

        const get_marketTokens: any = await getMarketCoins();
        setMyOrderBuyLists(get_marketTokens[myOrderId])
      }
      setLoading(false)

    } catch (error) {
      console.log('error', error)
      toast.error(`Error Create Order `)
      setLoading(false)
    }
  }

  const handleCopy = () => {
    copy(marketItemLists?.id?.account)
    toast.success(`Copied`)
  }

  useEffect(() => {
    (
      async () => {
        try {
          if (showModal === true) {
            setLoading(true)
            const get_marketTokens: any = await getMarketCoins();
            setMarketItemLists(get_marketTokens[myOrderId])
            setLoading(false)
          }

        } catch (error) {
          console.log('error', error)
          setLoading(false)
        }
      }
    )()

  }, [showModal])

  return (
    <>
      {
        isLoading ?
          <div id="preloader"></div> :
          <div id="preloader" style={{ display: "none" }}></div>
      }
      {showModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto w-[420px]">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="modalHeader p-5 border-b border-solid border-slate-200 rounded-t relative">
                  <div className="w-full">
                    <div className="flex justify-between">
                      <div className="flex items-center ">
                        <img className="w-[45px] mr-1 " src={modalImage} />
                        <h3 className="text-white font-medium text-2xl">
                          {marketItemLists?.id?.name}
                        </h3>
                      </div>
                      <div className="flex socialIconsContainer justify-between items-center mr-4">
                        <TwitterIcon className="mr-1" />
                        <DiscordIcon className="mr-1" />
                        <GlobeIcon />
                      </div>
                    </div>
                    <div className="flex gap-2 text-white font-medium mt-2 items-center ">
                      <p>
                        {marketItemLists?.id?.account ?
                          marketItemLists?.id?.account.substr(0, 6) + "..." + marketItemLists?.id?.account.substr(marketItemLists?.id?.account.length - 6, marketItemLists?.id?.account.length)
                          : ``}
                      </p>
                      <div className="flex ml-[-4x] items-center">
                        <CopyToClipBoard className="mr-1" onClick={handleCopy} />
                        <TokenGlobe />
                      </div>
                      <button
                        onClick={() =>
                          setBuyOrderModal(true)
                        }
                        className="flex items-center py-1 px-2 rounded ml-2 bg-[#e17f6e] hover:bg-orange-500"
                      >
                        Create Buy Order
                      </button>
                    </div>
                  </div>
                  <ModalCloseIcon
                    className="modalCloseIcon"
                    onClick={() => {
                      navigate(location.pathname);
                      setShowModal(false);
                    }}
                  />
                </div>
                <div className="relative modalContentContainer flex-auto">
                  <div className="tabsContainer">
                    <div className="px-2 headerNavs flex justify-between">
                      <button
                        onClick={() =>
                          handleTabChange(ETabOptions.TOKEN_LISTING)
                        }
                        className={`text-black font-medium py-1 p-2 my-2 flex justify-center items-center ${activeTab === ETabOptions.TOKEN_LISTING
                          ? "activeTab"
                          : ""
                          }`}
                      >
                        <ListIcon className="mr-1" />
                        Listings
                      </button>
                      <button
                        onClick={() => handleTabChange(ETabOptions.MY_ORDERS)}
                        className={`text-black font-medium py-1 p-2 my-2 flex justify-center items-center ${activeTab === ETabOptions.MY_ORDERS ? "activeTab" : ""
                          }`}
                      >
                        <ProfileIcon className="mr-1" />
                        Orders
                      </button>
                      <button
                        onClick={() =>
                          handleTabChange(ETabOptions.RECENT_TRADES)
                        }
                        className={`text-black font-medium py-1 p-2 my-2 flex justify-center items-center ${activeTab === ETabOptions.RECENT_TRADES
                          ? "activeTab"
                          : ""
                          }`}
                      >
                        <RecentsIcon className="mr-1" />
                        Recent Trades
                      </button>
                    </div>
                  </div>
                  <Table
                    showSubHeader={activeTab === ETabOptions.MY_ORDERS}
                    setActiveTab={setActiveTab}
                    onRowClick={() => { }}
                    columns={columns}
                    marketItemLists={marketItemLists}
                    setMarketItemLists={setMarketItemLists}
                    myOrderSellLists={myOrderSellLists}
                    topTab={activeTab}
                    myOrderId={myOrderId}
                    myOrderBuyLists={myOrderBuyLists}
                    setMyOrderBuyLists={setMyOrderBuyLists}
                    recentTradesList={recentTradesList}
                    filterMarketTokenLists={filterMarketTokenLists}
                    setFilterMarketTokenLists={setFilterMarketTokenLists}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-60 fixed inset-0 z-40 bg-black"></div>

          {
            buyOrderModal && <>
              <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
                <div className="relative w-auto my-6 mx-auto max-w-3xl">
                  {/*content*/}
                  <div className="w-[300px] border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                    {/*header*/}
                    <div className="modalHeader p-3 border-b border-solid border-slate-200 rounded-t relative">
                      <h3 className="text-white font-medium text-2xl">
                        Create Buy Order
                      </h3>
                      <ModalCloseIcon
                        className="modalCloseIcon"
                        onClick={() => {
                          setBuyOrderModal(false);
                        }}
                      />
                    </div>
                    <div className="p-4" >
                      <div className="flex items-center justify-between gap-2 " >
                        <p>Price : </p>
                        <input
                          value={orderPrice}
                          onChange={(e: any) => setOrderPrice(e.target.value)}
                          className="border-orange border-[2px] border-[solid] "
                        />
                      </div>

                      <div className="flex items-center justify-between gap-2 mt-2" >
                        <p>Amount : </p>
                        <input
                          value={orderAmount}
                          onChange={(e: any) => setOrderAmount(e.target.value)}
                          className="border-orange border-[2px] border-[solid] "
                        />
                      </div>
                      <button
                        onClick={handleCreateBuy}
                        className="flex items-center tradeButton py-1 px-2 rounded hover:bg-orange-500"
                        style={{ margin: `16px auto` }}
                      >

                        Create Buy Order
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="opacity-60 fixed inset-0 z-40 bg-black"></div>
            </>
          }
        </>
      ) : null}
    </>
  );
}
