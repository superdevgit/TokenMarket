import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useWallet } from "@manahippo/aptos-wallet-adapter";

import { ReactComponent as TokenGlobeIcon } from "../icons/table-body-icons/token_globe.svg";
import { ReactComponent as SaveToClipboard } from "../icons/table-body-icons/copy_to_clipboard.svg";
import TableHeader from "../components/table/TableHeader";
import { copyClipBoard, getMarketCoins } from "../helpers/aptos";
import { APTOS_DECIMAL } from "../constants";

export default function MyOrders() {
  const { account } = useWallet();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("buy");
  const [isLoading, setLoading] = useState(false)
  const [marketAllCoins, setMarketAllCoins] = useState([])
  const [marketTokenLists, setMarketTokenLists] = useState<any[]>([])
  const [filterMarketTokenLists, setFilterMarketTokenLists] = useState<any[]>([...marketTokenLists])
  const [searchToken, setSearchToken] = useState('')


  const handleSearchToken = (event: any) => {
    setSearchToken(event);

    const searched = !event ? marketTokenLists :
      marketTokenLists.filter((item: any) => item.name.toLowerCase().includes(event.toLowerCase()))
    setFilterMarketTokenLists(searched)
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const get_marketTokens: any = await getMarketCoins();
        setMarketAllCoins(get_marketTokens)

        let myoder_marketTokens = []

        for (let i = 0; i < get_marketTokens.length; i++) {
          for (let j = 0; j < get_marketTokens[i].wallets.length; j++) {
            if (get_marketTokens[i].wallets[j] === account?.address) {
              myoder_marketTokens.push(get_marketTokens[i])
            }
          }
        }

        const filter_marketToken = []
        for (let i = 0; i < myoder_marketTokens.length; i++) {
          let total_listingAmount = 0, floor_coin_array = [];
          for (let j = 0; j < myoder_marketTokens[i].lists.length; j++) {
            total_listingAmount = total_listingAmount + Number(myoder_marketTokens[i].lists[j].amount)
            floor_coin_array.push(Number(myoder_marketTokens[i].lists[j].price) / APTOS_DECIMAL)
          }
          const floor_coin_value = Math.min.apply(Math, floor_coin_array)

          if (total_listingAmount > 0) {
            filter_marketToken.push({
              name: myoder_marketTokens[i].id.name,
              coinAddress: myoder_marketTokens[i].id.account,
              list_totalAmount: total_listingAmount / (Math.pow(10, myoder_marketTokens[i].id.decimals)),
              floorCoin: floor_coin_value ? floor_coin_value : 0
            })
          }

        }
        setMarketTokenLists(filter_marketToken)
        setFilterMarketTokenLists(filter_marketToken)
        setLoading(false)

      } catch (error) {
        console.log('error', error)
        setLoading(false)

      }
    })()
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
      {/* <Table
        showSubHeader={true}
        onRowClick={handleTokenItemClick}
        columns={columns}
        data={data(20)}
      /> */}
      <div className="m-siteView">
        <div className="subHeaderContainer flex justify-center items-center">
          <label
            htmlFor="Toggle3"
            className="inline-flex items-center p-2 rounded-md cursor-pointer dark:text-gray-800"
          >
            <input id="Toggle3" type="checkbox" className="hidden peer" />
            <span
              onClick={() => {
                setActiveTab("sell");
              }}
              className={`px-4 py-2 rounded-l-md subHeaderActions sellOrderBtn ${activeTab === "sell" ? "activeOption" : ""
                }`}
            >
              Sell Orders
            </span>
            <span
              onClick={() => {
                setActiveTab("buy");
              }}
              className={`px-4 py-2 rounded-r-md subHeaderActions buyOrderBtn ${activeTab === "buy" ? "activeOption" : ""
                }`}
            >
              Buy Orders
            </span>
          </label>
        </div>

      </div>
      <div className="tableContainer" >
        <table className="items-center tableStyles w-full border-collapse">
          <thead>
            <tr className={`columnsContianerStyles ${location.pathname === "/my-orders" ? "tokenListTableHeaderColumns" : ""
              }`}>
              <th className="px-6 bg-blueGray-50 text-white align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                Token
              </th>
              <th className="px-6 bg-blueGray-50 text-white align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                Token Address
              </th>
              {/* <th className="px-6 bg-blueGray-50 text-white align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                <div className="flex items-center">
                  TRX
                </div>
              </th> */}
              <th className="px-6 bg-blueGray-50 text-white align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                <div className="flex items-center">
                  Quantity
                </div>
              </th>
              <th className="px-6 bg-blueGray-50 text-white align-middle border border-solid border-blueGray-100 py-3 text-xs uppercase border-l-0 border-r-0 whitespace-nowrap font-semibold text-left">
                Price
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
                        <p className="flex items-center ">{item.name}</p>
                      </td>
                      <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2" >
                        <div className="flex items-center ">
                          {item?.coinAddress?.substr(0, 6) + '...' + item?.coinAddress?.substr(item.coinAddress?.length - 4, item.coinAddress?.length)} <SaveToClipboard className="ml-2 cursor-pointer "
                            onClick={() => copyClipBoard(item?.coinAddress)}
                          />
                        </div>
                      </td>
                      <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2" >
                        <p className="flex items-center ">{item.list_totalAmount}</p>
                      </td>
                      <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2" >
                        <p className="flex items-center ">{item.floorCoin}<TokenGlobeIcon className="ml-1" /></p>
                      </td>
                      {/* <td className="text-white border-t-0 px-6 align-middle border-l-0 border-r-0 text-xs p-2" >
                        <button onClick={() => handleTokenItemClick(idx)} className="flex items-center tradeButton py-1 px-2 rounded cursor-pointer hover:bg-orange-500">
                          Trade <TransactionIcon className="ml-2" />
                        </button>
                      </td> */}

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