import { ReactNode, useState } from "react";
import { useWallet } from "@manahippo/aptos-wallet-adapter";

import "./tableStyles.scss";
import { useLocation } from "react-router-dom";
import { ReactComponent as TokenGlobeIcon } from "../../icons/table-body-icons/token_globe.svg";
import { ReactComponent as DollarIcon } from "../../icons/table-body-icons/token_globe.svg";
import { ReactComponent as TransactionIcon } from "../../icons/table-body-icons/token_globe.svg";
import { APTOS_DECIMAL } from "../../constants";
import { toast } from "react-hot-toast";
import { buy, cancelBuyOrdder, fillOrder, hex_to_ascii, updateBuyOrder, getMarketCoins } from "../../helpers/aptos";

export default function Table({
  setActiveTab,
  columns,
  onRowClick,
  marketItemLists,
  setMarketItemLists,
  myOrderId,
  topTab,
  myOrderBuyLists,
  setMyOrderBuyLists,
  recentTradesList,
  filterMarketTokenLists,
  setFilterMarketTokenLists
}: {
  setActiveTab: any;
  columns: { key: string; title: string | (() => ReactNode) }[];
  marketItemLists: any,
  onRowClick: (id: string) => void;
  showSubHeader?: boolean;
  setMarketItemLists: any;
  myOrderSellLists: any;
  topTab: any;
  myOrderId: any;
  myOrderBuyLists: any;
  setMyOrderBuyLists: any;
  recentTradesList: any;
  filterMarketTokenLists: any;
  setFilterMarketTokenLists: any;
}) {
  const { account, signAndSubmitTransaction }: any = useWallet()
  const [isLoading, setLoading] = useState(false)
  const location = useLocation();
  const [selectedQuantity, setSelectedQuantity] = useState(0);
  const [selectedSellQuantity, setSelectedSellQuantity] = useState(0);
  const [updateOrderPrice, setUpdateOrderPrice] = useState(0)
  const [tokenIdToBuy, setTokenIdToBuy] = useState<number>();
  const [sellIdBuy, setSellIdBuy] = useState<number>()
  const [updateIdOrder, setUpdateOrder] = useState<boolean>(false)

  const handleTrade = async (curAmount: any, coinId: any, lister: any, buyId: any) => {
    try {
      if (!account?.address) {
        toast.error(`Please connect your wallet`)
        return
      }
      if (selectedQuantity <= 0 || selectedQuantity > curAmount) {
        toast.error(`Amount is bigger than 0 and is smaller over than ${curAmount}`)
        return
      }
      const module_name = await hex_to_ascii(marketItemLists?.id.module_name.toString())
      const struct_name = await hex_to_ascii(marketItemLists?.id.struct_name.toString())

      const coinAddress_name = marketItemLists?.id.account + "::" +
        module_name.substring(1) + "::" + struct_name.substring(1)

      setLoading(true)
      const tx: any = await buy(
        coinAddress_name,
        coinId,
        lister,
        selectedQuantity * Math.pow(10, marketItemLists?.id?.decimals)
      )

      const result = await signAndSubmitTransaction(tx);
      if (result) {
        if (Number(selectedQuantity) === curAmount) {
          let temp
          if (buyId > -1) {
            marketItemLists.lists.splice(buyId, 1)
            temp = marketItemLists.lists
          }
          const res_marketLists = {
            id: marketItemLists?.id,
            lists: temp,
            wallets: marketItemLists?.wallets
          }
          setMarketItemLists(res_marketLists)

          let remain_lists
          if (coinId > -1) {
            filterMarketTokenLists.splice(coinId, 1)
            remain_lists = filterMarketTokenLists
          }
          setFilterMarketTokenLists(remain_lists)

        } else {

          const temp = marketItemLists?.lists[coinId].amount - selectedQuantity * Math.pow(10, marketItemLists?.id?.decimals)
          const set_marketLists = marketItemLists.lists.map((item: any, idx: any) => {
            return idx === coinId ? {
              ...marketItemLists.lists[coinId],
              amount: temp.toString()
            } : item
          })

          const res_marketLists = {
            id: marketItemLists?.id,
            lists: set_marketLists,
            wallets: marketItemLists?.wallets
          }

          setMarketItemLists(res_marketLists)

          const filter_market = filterMarketTokenLists.map((item: any, index: any) => {
            const res = index === coinId ? {
              ...item,
              list_totalAmount: item.list_totalAmount - selectedQuantity
            }
              : item
            return res
          })
          setFilterMarketTokenLists(filter_market)
        }

        toast.success(`Successfully buy ${selectedQuantity} amounts `)
      }
      setLoading(false)

    } catch (error) {
      console.log('error', error)
      setLoading(false)

    }
  }

  const handleUpdateOrder = async (coinId: any, buyId: any) => {
    try {
      if (!account?.address) {
        toast.error(`Please connect your wallet`)
        return
      }
      if (Number(updateOrderPrice) <= 0) {
        toast.error(`Error`)
        return
      }
      const module_name = await hex_to_ascii(marketItemLists?.id.module_name.toString())
      const struct_name = await hex_to_ascii(marketItemLists?.id.struct_name.toString())

      const coinAddress_name = marketItemLists?.id.account + "::" +
        module_name.substring(1) + "::" + struct_name.substring(1)

      setLoading(true)
      const tx: any = await updateBuyOrder(
        coinAddress_name,
        coinId,
        Number(updateOrderPrice)
      )

      const res = await signAndSubmitTransaction(tx)
      if (res) {
        toast.success(`Successfully Update Buy Order`)
        const buyOrder = myOrderBuyLists.buy_orders.map((item: any, idx: any) => {
          const result = idx === buyId ? { ...item, price: (Number(updateOrderPrice) * APTOS_DECIMAL).toString() } : item;
          return result
        })

        setMyOrderBuyLists({ ...myOrderBuyLists, buy_orders: buyOrder })
      }
      setLoading(false)
    } catch (error) {
      console.log('error', error)
      toast.error(`Error Update `)
      setLoading(false)
    }
  }

  const handleCancelOrder = async (coinId: any, cancelId: any) => {
    setActiveTab('my-orders')
    if (!account?.address) {
      toast.error(`Please connect your wallet`)
      return
    }
    try {
      const module_name = await hex_to_ascii(marketItemLists?.id.module_name.toString())
      const struct_name = await hex_to_ascii(marketItemLists?.id.struct_name.toString())

      const coinAddress_name = marketItemLists?.id.account + "::" +
        module_name.substring(1) + "::" + struct_name.substring(1)

      setLoading(true)
      const tx: any = await cancelBuyOrdder(
        coinAddress_name,
        coinId,
      )

      const res = await signAndSubmitTransaction(tx)
      if (res) {
        toast.success(`Successfully Cancel`)
        let temp;
        if (cancelId > -1) {
          myOrderBuyLists.buy_orders.splice(cancelId, 1);
          temp = myOrderBuyLists.buy_orders
        }
        setMyOrderBuyLists({ ...myOrderBuyLists, buy_orders: temp })
        setLoading(true)
        const get_marketTokens: any = await getMarketCoins();
        setMyOrderBuyLists(get_marketTokens[myOrderId])
      }
      setLoading(false)

    } catch (error) {
      console.log('error', error)
      setLoading(false)
    }
  }

  const handleSellOrder = async (curAmount: any, coinId: any, buyer: any, sellId: any) => {
    console.log('selectedSellQuantity', selectedSellQuantity)
    console.log('buyorder', buyer)
    if (!account?.address) {
      toast.error(`Please connect your wallet`)
      return
    }
    if (selectedSellQuantity <= 0 || selectedSellQuantity > curAmount) {
      toast.error(`Amount is bigger than 0 and is smaller over than ${curAmount}`)
      return
    }
    try {
      setLoading(true)

      const module_name = await hex_to_ascii(myOrderBuyLists?.id.module_name.toString())
      const struct_name = await hex_to_ascii(myOrderBuyLists?.id.struct_name.toString())

      const coinAddress_name = myOrderBuyLists?.id.account + "::" +
        module_name.substring(1) + "::" + struct_name.substring(1)
      console.log('coinAddress_name', coinAddress_name)
      const tx: any = await fillOrder(
        coinAddress_name,
        coinId,
        buyer,
        Number(selectedSellQuantity) * Math.pow(10, marketItemLists?.id?.decimals)
      )

      const res = await signAndSubmitTransaction(tx)
      if (res) {
        if (Number(selectedSellQuantity) === curAmount) {
          let temp
          if (sellId > -1) {
            myOrderBuyLists.buy_orders.splice(sellId, 1)
            temp = myOrderBuyLists.buy_orders
          }
          const res_marketLists = {
            id: myOrderBuyLists?.id,
            buy_orders: temp,
            buy_wallets: myOrderBuyLists?.buy_wallets
          }
          setMyOrderBuyLists(res_marketLists)

        } else {
          const temp = myOrderBuyLists?.buy_orders[sellId].amount - selectedSellQuantity * Math.pow(10, myOrderBuyLists?.id?.decimals)
          const set_marketLists = myOrderBuyLists.buy_orders.map((item: any, idx: any) => {
            return idx === sellId ? {
              ...myOrderBuyLists.buy_orders[sellId],
              amount: temp.toString()
            } : item
          })
          const res_marketLists = {
            id: myOrderBuyLists?.id,
            buy_orders: set_marketLists,
            buy_wallets: myOrderBuyLists?.buy_wallets
          }

          setMyOrderBuyLists(res_marketLists)
        }

        toast.success(`Successfully buy ${selectedSellQuantity} amounts `)

      }

      setLoading(false)
    } catch (error) {
      console.log('error', error)
      setLoading(false)
    }
  }

  return (
    <>
      {
        isLoading ?
          <div id="preloader"></div> :
          <div id="preloader" style={{ display: "none" }}></div>
      }
      <div className="tableContainer">
        {/* {showSubHeader && subHeader()} */}
        <table className="items-center tableStyles w-full border-collapse">
          <thead>
            <tr
              className={`columnsContianerStyles ${location.pathname === "/" ? "tokenListTableHeaderColumns" : ""
                }`}
            >

              {columns?.map((column) => {
                return (
                  <th className="px-6 bg-blueGray-50 text-white align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                    {typeof column?.title === "string"
                      ? column?.title
                      : column?.title()}
                  </th>
                );
              })}
            </tr>
          </thead>
          {
            topTab === '' && <tbody>
              {marketItemLists?.lists?.filter((item: any) => item?.amount > 0).map((item: any, index: any) => (
                <tr
                  style={{
                    background: index % 2 === 1 ? "#16181D" : "#414654",
                  }}
                  onClick={() => {
                    onRowClick("test");
                  }}
                  className="cursor-pointer"
                >

                  <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2">
                    <div className="flex items-center gap-1 ">
                      <TokenGlobeIcon className="ml-1" />
                      {item.price / APTOS_DECIMAL}
                    </div>
                  </td>
                  <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2">
                    <div className="flex items-center justify-center">
                      {item.amount / Math.pow(10, marketItemLists?.id.decimals)}
                    </div>
                  </td>
                  <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2">
                    <div className="flex justify-end">
                      {tokenIdToBuy === index && (
                        <div className="flex items-center mr-2">

                          <input
                            min=""
                            value={selectedQuantity}
                            onChange={(e: any) => setSelectedQuantity(e.target.value)}
                            placeholder="Enter QTY"
                            className="flex items-center enterQtyInput tradeButton p-1 rounded hover:bg-orange-500"
                          />
                        </div>
                      )}
                      {
                        tokenIdToBuy === index ?
                          <button
                            onClick={() =>
                              handleTrade(
                                item.amount / Math.pow(10, marketItemLists?.id.decimals),
                                myOrderId,
                                marketItemLists.wallets[index],
                                index
                              )}
                            className="flex items-center tradeButton py-1 px-2 rounded hover:bg-orange-500"
                          >
                            Trade
                            <DollarIcon className="ml-2" />
                          </button>
                          :
                          <button
                            onClick={() => setTokenIdToBuy(index)}
                            className="flex items-center tradeButton py-1 px-2 rounded hover:bg-orange-500"
                          >
                            Buy
                            <TransactionIcon className="ml-2" />
                          </button>

                      }

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          }


          {
            topTab === 'my-orders' && <tbody>
              {
                myOrderBuyLists?.buy_orders.filter((item: any) => Number(item.amount) > 0).length > 0 ?
                  myOrderBuyLists?.buy_orders.filter((item: any) => Number(item.amount) > 0).map((item: any, index: any) => (
                    <tr
                      style={{
                        background: index % 2 === 1 ? "#16181D" : "#414654",
                      }}
                      onClick={() => {
                        onRowClick("test");
                      }}
                      key={index}
                    >

                      <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2">
                        <div className="flex items-center ">
                          {item.price / APTOS_DECIMAL}
                          <TokenGlobeIcon className="ml-1" />
                        </div>
                      </td>
                      <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2">
                        <div className="flex items-center ">
                          {Number(item.amount) / Math.pow(10, myOrderBuyLists?.id.decimals)}
                        </div>
                      </td>
                      <td className="text-white border-t-0 align-middle border-l-0 border-r-0 text-xs p-2">
                        <div className="flex justify-end">
                          {
                            myOrderBuyLists?.buy_wallets[index] === account.address ?
                              <div className="flex gap-2 " >
                                {
                                  updateIdOrder && <div className="flex items-center justify-center">

                                    <input
                                      min=""
                                      value={updateOrderPrice}
                                      onChange={(e: any) => setUpdateOrderPrice(e.target.value)}
                                      placeholder="Enter Price"
                                      className="flex items-center enterQtyInput tradeButton p-1 rounded hover:bg-orange-500"
                                    />
                                  </div>
                                }
                                <div className="flex gap-1 " >
                                  {
                                    updateIdOrder ?
                                      <button
                                        onClick={() => handleUpdateOrder(myOrderId, index)}
                                        className="flex items-center tradeButton py-1 px-2 rounded hover:bg-orange-500"
                                      >
                                        Trade
                                      </button>
                                      :
                                      <button
                                        onClick={() => setUpdateOrder(true)}
                                        className="flex items-center tradeButton py-1 px-2 rounded hover:bg-orange-500"
                                      >
                                        Update
                                      </button>
                                  }


                                  <button
                                    onClick={() => handleCancelOrder(myOrderId, index)}
                                    className="flex items-center tradeButton py-1 px-2 rounded hover:bg-orange-500"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>

                              :
                              <div className="flex items-center gap-2">
                                {sellIdBuy === index && (


                                  <input
                                    min=""
                                    value={selectedSellQuantity}
                                    onChange={(e: any) => setSelectedSellQuantity(e.target.value)}
                                    placeholder="Enter QTY"
                                    className="flex items-center enterQtyInput tradeButton p-1 rounded hover:bg-orange-500"
                                  />
                                )}
                                {
                                  sellIdBuy === index ?
                                    <button
                                      onClick={() => handleSellOrder(
                                        item.amount / Math.pow(10, myOrderBuyLists?.id.decimals),
                                        myOrderId, myOrderBuyLists?.buy_wallets[index], index)}
                                      className="flex items-center tradeButton py-1 px-2 rounded hover:bg-orange-500"
                                    >
                                      Trade
                                    </button>
                                    :
                                    <button
                                      onClick={() => { setSellIdBuy(index); setUpdateOrder(false) }
                                      }
                                      className="flex items-center tradeButton py-1 px-2 rounded hover:bg-orange-500"
                                    >
                                      Sell
                                    </button>

                                }
                              </div>
                          }

                        </div>
                      </td>
                    </tr>
                  ))
                  :
                  <div className="text-center absolute left-[50%] translate-x-[-50%] mt-[16px] " >No exist order lists</div>

              }
            </tbody>
          }

          {
            topTab === 'recent-trades' && <tbody>
              {
                recentTradesList.length > 0 ?

                  recentTradesList.sort((a: any, b: any) => Number(b.data.timestamp) - Number(a.data.timestamp)).map((item: any, index: any) => {
                    const activityHour: any = (Number(Date.now() - Number(item.data.timestamp) * 1000) / 3600000).toFixed(0); // hour about milisection
                    const activityMinute: any = Number((Number(Date.now() - Number(item.data.timestamp) * 1000) / 3600000) * 60).toFixed(0) // Minute about milisection
                    const activityDays: any = Number(activityHour / 24).toFixed(0)
                    const activityMonths: any = Number(activityDays / 30).toFixed(0)
                    return (
                      <tr
                        style={{
                          background: index % 2 === 1 ? "#16181D" : "#414654",
                        }}
                        onClick={() => {

                          onRowClick("test");
                        }}
                        className="cursor-pointer"
                      >

                        <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2">
                          <div className="flex items-center ">
                            {
                              activityDays > 30 ?
                                activityMonths.length > 1 ?
                                  <p>{activityMonths} months ago </p>
                                  :
                                  <p>{`a month ago`} </p>
                                :
                                activityHour > 24 ?
                                  <p> {activityDays} days ago </p>
                                  :
                                  activityMinute >= 60 ?
                                    <p> {activityHour}  hours ago </p>
                                    : activityMinute >= 1 ?

                                      <p>{activityMinute} Minutes ago </p>
                                      :
                                      <p> less than a minute </p>
                            }
                          </div>
                        </td>
                        <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2">
                          <div className="flex items-center ">
                            <a href={`https://explorer.aptoslabs.com/txn/${item.version}`} target={`_blank`} >
                              {item.version}
                            </a>
                          </div>
                        </td>
                        <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2">
                          <div className="flex items-center ">
                            {Number(item.data.price) / APTOS_DECIMAL}/
                            {Number(item.data.amount) / Math.pow(10, item.data.coin_info.decimals)}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                  :
                  <div className="text-center absolute left-[50%] translate-x-[-50%] mt-[16px] " >No exist recent trades lists</div>
              }
            </tbody>
          }

        </table>
      </div>
    </>
  );
}
