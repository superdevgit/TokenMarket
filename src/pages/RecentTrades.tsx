import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { ReactComponent as TokenGlobeIcon } from "../icons/table-body-icons/token_globe.svg";
import { ReactComponent as SortIcon } from "../icons/table-header-icons/sort_icon.svg";
import { ReactComponent as SaveToClipboard } from "../icons/table-body-icons/copy_to_clipboard.svg";
import TableHeader from "../components/table/TableHeader";
import { getRecentTrades, getResources, copyClipBoard } from "../helpers/aptos";
import { APTOS_DECIMAL } from "../constants";

export default function RecentTrades() {
  const location = useLocation();
  const [isLoading, setLoading] = useState(false)

  const [recentTradesList, setRecentTradesList] = useState([])
  const [filterRecentTradesList, setFilterRecentTradesList] = useState<any[]>([...recentTradesList])
  const [searchToken, setSearchToken] = useState('')

  const handleSearchToken = (event: any) => {
    setSearchToken(event);

    const searched = !event ? recentTradesList :
      recentTradesList.filter((item: any) => item?.data.coin_info.name.toLowerCase().includes(event.toLowerCase()))
    setFilterRecentTradesList(searched)
  }

  useEffect(() => {
    (
      async () => {
        try {
          setLoading(true)
          const resource: any = await getResources();
          const creation_num = resource?.coinMarketStore?.data?.buy_event.guid.id.creation_num;
          const address = resource?.coinMarketStore?.data?.buy_event.guid.id.addr;
          const res: any = await getRecentTrades(creation_num, address);
          setFilterRecentTradesList(res ? res : [])
          setRecentTradesList(res ? res : [])
          setLoading(false)

        } catch (error) {
          console.log('error', error)
          setLoading(false)

        }
      }
    )()
  }, [])

  return (
    <div>
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
            <tr className={`columnsContianerStyles ${location.pathname === "/recent-trades" ? "tokenListTableHeaderColumns" : ""
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
                  Buy Quantity <SortIcon className="ml-1 cursor-pointer sortIcon" />
                </div>
              </th>
              <th className="px-6 bg-blueGray-50 text-white align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                <div className="flex items-center">
                  Buy Amount
                </div>
              </th>
              <th className="px-6 bg-blueGray-50 text-white align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                <div className="flex items-center">
                  Buy Date
                </div>
              </th>
              <th className="px-6 bg-blueGray-50 text-white align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                <div className="flex items-center">
                  wallet
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {
              filterRecentTradesList.length > 0 ?
                filterRecentTradesList.sort((a: any, b: any) => b?.data.timestamp - a?.data.timestamp).map((item: any, idx: any) => {
                  const activityHour: any = (Number(Date.now() - Number(item?.data.timestamp) * 1000) / 3600000).toFixed(0); // hour about milisection
                  const activityMinute: any = Number((Number(Date.now() - Number(item?.data.timestamp) * 1000) / 3600000) * 60).toFixed(0) // Minute about milisection

                  const activityDays: any = Number(activityHour / 24).toFixed(0)
                  const activityMonths: any = Number(activityDays / 30).toFixed(0)

                  return (
                    <tr key={idx}
                      style={{
                        background: idx % 2 === 1 ? "#16181D" : "#414654",
                      }}
                    >
                      <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2" >
                        {/* <RowFavicon /> */}
                      </td>
                      <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2" >
                        <p className="flex items-center ">{item?.data.coin_info.name}</p>
                      </td>
                      <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2" >
                        <div className="flex items-center ">
                          {item?.data?.coin_info?.account?.substr(0, 6) + '...' + item?.data?.coin_info?.account?.substr(item.data?.coin_info?.account?.length - 4, item.data?.coin_info?.account?.length)}
                          <SaveToClipboard className="ml-2 cursor-pointer"
                            onClick={() => copyClipBoard(item?.data?.coin_info?.account)}
                          />
                        </div>
                      </td>
                      <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2" >
                        <p className="flex items-center ">{Number(item?.data.price) / APTOS_DECIMAL}<TokenGlobeIcon className="ml-1" /></p>
                      </td>
                      <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2" >
                        <p className="flex items-center ">{item?.data.amount / Math.pow(10, item.data.coin_info.decimals)}</p>
                      </td>
                      <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2" >
                        <p className="flex items-center ">
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
                        </p>
                      </td>
                      <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2" >
                        <div className="flex items-center ">
                          {item?.data?.wallet?.substr(0, 6) + '...' + item?.data?.wallet?.substr(item.data?.wallet?.length - 4, item.data?.wallet?.length)}
                          <SaveToClipboard className="ml-2 cursor-pointer"
                            onClick={() => copyClipBoard(item.data?.wallet)
                            }
                          />
                        </div>
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

    </div>
  );
}
