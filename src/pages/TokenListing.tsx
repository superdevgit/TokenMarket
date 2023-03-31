import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ReactComponent as RowFavicon } from "../icons/table-body-icons/table_row_favicon.svg";
import { ReactComponent as TokenGlobeIcon } from "../icons/table-body-icons/token_globe.svg";
import { ReactComponent as TransactionIcon } from "../icons/table-body-icons/transaction.svg";
import { ReactComponent as SaveToClipboard } from "../icons/table-body-icons/copy_to_clipboard.svg";
import { ReactComponent as SortIcon } from "../icons/table-header-icons/sort_icon.svg";
import TableHeader from "../components/table/TableHeader";

import Modal from "../components/modal/TradeModal";
import _ from "lodash";
import { ETabOptions } from "../components/table/TableHeader";
import { getMarketCoins, getResources, getRecentTrades, copyClipBoard, getCoinInfo } from "../helpers/aptos";
import { APTOS_DECIMAL } from "../constants";

export default function TokenListing() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState(
    ETabOptions.TOKEN_LISTING,
  );

  const [marketAllCoins, setMarketAllCoins] = useState<any[]>([])
  const [marketTokenLists, setMarketTokenLists] = useState<any[]>([])
  const [filterMarketTokenLists, setFilterMarketTokenLists] = useState<any[]>([...marketTokenLists])

  const [marketItemLists, setMarketItemLists] = useState<any>({})
  const [myOrderSellLists, setMyOrderSellLists] = useState<any>({})
  const [myOrderBuyLists, setMyOrderBuyLists] = useState<any>({})
  const [recentTradesList, setRecentTradesList] = useState([])

  const [myOrderId, setMyOrderId] = useState(-1)
  const [isLoading, setLoading] = useState(false)
  const [searchToken, setSearchToken] = useState('')


  function handleTokenItemClick(id: any) {
    setShowModal(true);
    let myoder_marketTokens: any = []

    setMyOrderId(id)

    const modal_RecentTradesList = recentTradesList.filter((item: any) =>
      item.data.coin_info.account === marketAllCoins[id].id.account
    )
    setMyOrderSellLists(myoder_marketTokens[id])
    setMyOrderBuyLists(marketAllCoins[id])
    setRecentTradesList(modal_RecentTradesList)

    navigate({
      pathname: location.pathname,
      search: `?id=${id}&type=item_detail`,
    });
  }


  const handleSearchToken = (event: any) => {
    setSearchToken(event);

    const searched = !event ? marketTokenLists :
      marketTokenLists.filter((item: any) => item.name.toLowerCase().includes(event.toLowerCase()))
    setFilterMarketTokenLists(searched)
  }

  const modalTableComuns =
    modalActiveTab === ETabOptions.RECENT_TRADES
      ? [
        { title: "Time", key: "" },
        { title: "TRX", key: "" },
        { title: "Price / QTY", key: "" },
      ]
      : [
        { title: "Price", key: "" },
        { title: "Quantity", key: "" },
        { title: "", key: "" },
      ];


  useEffect(() => {
    (async () => {
      try {
        setLoading(true)

        const get_marketTokens: any = await getMarketCoins();
        setMarketAllCoins(get_marketTokens)

        const filter_marketToken: any = []

        await Promise.all(await get_marketTokens.map((marketToken: any) => {
          let total_listingAmount = 0, floor_coin_array: any[] = [];

          marketToken.lists.map((item: any) => {
            total_listingAmount = total_listingAmount + Number(item.amount)
            floor_coin_array.push(Number(item.price) / APTOS_DECIMAL)
          })
          const floor_coin_value = Math.min.apply(Math, floor_coin_array)
          if (Number(total_listingAmount) > 0) {
            filter_marketToken.push({
              name: marketToken.id.name,
              coinAddress: marketToken.id.account,
              list_totalAmount: total_listingAmount / (Math.pow(10, marketToken.id.decimals)),
              floorCoin: floor_coin_value ? floor_coin_value : 0
            })
          }

        }))
        const get_coininfo = await getCoinInfo();
        for (let i = 0; i < get_coininfo.length; i++) {
          for (let j = 0; j < filter_marketToken.length; j++) {
            if (get_coininfo[i].symbol === filter_marketToken[j].name) {
              filter_marketToken[j].image = get_coininfo[i].logo_url
            }
          }
        }

        setMarketTokenLists(filter_marketToken)
        setFilterMarketTokenLists(filter_marketToken)

        const resource: any = await getResources();
        const creation_num = resource.coinMarketStore?.data?.buy_event.guid.id.creation_num;
        const address = resource.coinMarketStore?.data?.buy_event.guid.id.addr;
        const res: any = await getRecentTrades(creation_num, address);
        setRecentTradesList(res)
        setLoading(false)

      } catch (error) {
        console.log('error', error)
        setLoading(false)
      }
    })()
  }, [])

  useEffect(() => {
    (
      async () => {
        setLoading(true)
        const get_marketTokens: any = await getMarketCoins();
        // if (modalActiveTab === '') {
        //   console.log('get_marketTokens', get_marketTokens)
        //   setMarketItemLists(get_marketTokens[myOrderId])
        // }

        if (modalActiveTab === 'my-orders') {
          setMyOrderBuyLists(get_marketTokens[myOrderId])
        }

        if (modalActiveTab === 'recent-trades') {
          const resource: any = await getResources();
          const creation_num = resource.coinMarketStore?.data?.buy_event.guid.id.creation_num;
          const address = resource.coinMarketStore?.data?.buy_event.guid.id.addr;
          const res: any = await getRecentTrades(creation_num, address);

          const modal_RecentTradesList = res.filter((item: any) =>
            item.data.coin_info.account === marketAllCoins[myOrderId].id.account
          )
          setRecentTradesList(modal_RecentTradesList)
        }
        setLoading(false)

      }
    )()

  }, [modalActiveTab])

  return (
    <>
      {
        isLoading ?
          <div id="preloader"></div> :
          <div id="preloader" style={{ display: "none" }}></div>
      }
      <div>
        <div className="flex">
          <span className="text-3xl font-bold" style={{ color: "#F6A792" }}>
            Embers
          </span>
          <h2 className="text-white ml-1 font-bold text-3xl">
            Token Marketplace
          </h2>
        </div>
        <h4 className="text-white text-lg font-medium">
          Embers by Mavrik offers a secure and user-friendly platform for
          peer-to-peer crypto token trading with only fully vetted and
          approved tokens available. Join the future of Aptos token trading
          today.
        </h4>
      </div>
      <TableHeader
        searchToken={searchToken}
        handleSearchToken={handleSearchToken}
      />

      <div className="tableContainer" >
        <table className="items-center tableStyles w-full border-collapse">
          <thead>
            <tr className={`columnsContianerStyles ${location.pathname === "/" ? "tokenListTableHeaderColumns" : ""
              }`}>
              <th className="px-6 bg-blueGray-50 text-white align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left"></th>
              <th className="px-6 bg-blueGray-50 text-white align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                TokenName
              </th>
              <th className="px-6 bg-blueGray-50 text-white align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                Contract Address
              </th>
              <th className="px-6 bg-blueGray-50 text-white align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                <div className="flex items-center">
                  Listing Quantity <SortIcon className="ml-1 cursor-pointer sortIcon" />
                </div>
              </th>
              <th className="px-6 bg-blueGray-50 text-white align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                <div className="flex items-center">
                  Token Floor <SortIcon className="ml-1 cursor-pointer sortIcon" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {
              filterMarketTokenLists.length > 0 ?
                filterMarketTokenLists.map((item: any, idx: any) => {
                  return (
                    <tr key={idx}
                      style={{
                        background: idx % 2 === 1 ? "#16181D" : "#414654",
                      }}
                    >
                      <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2" >
                        <img className="w-[45px]" src={item?.image} />
                      </td>
                      <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2" >
                        <p className="flex items-center ">{item.name}</p>
                      </td>
                      <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2" >
                        <div className="flex items-center ">
                          {item?.coinAddress?.substr(0, 6) + '...' + item?.coinAddress?.substr(item.coinAddress?.length - 4, item.coinAddress?.length)} <SaveToClipboard className="ml-2 cursor-pointer" onClick={() => copyClipBoard(item?.coinAddress)} />
                        </div>
                      </td>
                      <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2" >
                        <p className="flex items-center ">{(item.list_totalAmount).toFixed(3)}</p>
                      </td>
                      <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2" >
                        <p className="flex items-center ">{Number(item.floorCoin).toFixed(3)}<TokenGlobeIcon className="ml-1" /></p>
                      </td>
                      <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2" >
                        <button onClick={() => handleTokenItemClick(idx)} className="flex items-center tradeButton py-1 px-2 rounded cursor-pointer hover:bg-orange-500">
                          Trade <TransactionIcon className="ml-2" />
                        </button>
                      </td>

                    </tr>
                  )
                })
                :
                isLoading ? <></>
                  :
                  <div className="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] text-[white]" >
                    <p>No exist the coin lists</p>
                  </div>
            }
          </tbody>
        </table>
      </div>

      <Modal
        setActiveTab={setModalActiveTab}
        activeTab={modalActiveTab}
        columns={modalTableComuns}
        showModal={showModal}
        setShowModal={setShowModal}
        marketItemLists={marketItemLists}
        setMarketItemLists={setMarketItemLists}
        myOrderSellLists={myOrderSellLists}
        myOrderBuyLists={myOrderBuyLists}
        setMyOrderBuyLists={setMyOrderBuyLists}
        myOrderId={myOrderId}
        recentTradesList={recentTradesList}
        filterMarketTokenLists={filterMarketTokenLists}
        setFilterMarketTokenLists={setFilterMarketTokenLists}
        modalImage={filterMarketTokenLists[myOrderId]?.image}
      />

    </>
  );
}
