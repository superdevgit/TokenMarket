import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useWallet } from "@manahippo/aptos-wallet-adapter";

import { getCoins, createList, getResources, getMarketCoins, cancelList, updateList, getSupply } from '../../helpers/aptos'
import { ReactComponent as ModalCloseIcon } from "../../icons/modal-icons/modal_close.svg";
import "./modalStyles.scss";
import { toast } from "react-hot-toast";
import { APTOS_DECIMAL } from "../../constants";

export default function TokenListModal({
  showModal,
  setShowModal,
}: {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { connected, account, signAndSubmitTransaction }: any = useWallet();

  const [isLoading, setLoading] = useState(false)
  const [showTokenDetails, setShowTokenDetails] = useState<any>({});
  const [showTokenInfo, setShowTokenInfo] = useState(false)
  const navigate = useNavigate();
  const location = useLocation();
  const [coinLists, setCoinLists] = useState([])

  const [coinPrice, setCoinPrice] = useState(0)
  const [amount, setAmount] = useState(0)
  const [listedAmount, setListedAmount] = useState(0)
  const [yourWallet, setYourWallet] = useState(0)
  const [floorPrice, setFloorPrice] = useState(0)
  const [marketCoinLists, setMarketCoinLists] = useState<any[]>([])
  const [coinUpdateStatus, setCoinUpdateStatus] = useState(false)
  const [feeAmount, setFeeAmount] = useState<any>(0)
  const handleTokenChange = async (event: any) => {
    if (event !== 'Select List') {
      setLoading(true)
      const get_coins: any = await getCoins(account?.address);
      const get_marketCoins: any = await getMarketCoins();
      const res_coin: any = get_coins.find((item: any) => item.name === event)
      const filter_coinAddress_owner = res_coin.coinAddress.split('::')[0]

      const total_supply = await getSupply(res_coin.coinAddress);

      const exist_coin: any = get_marketCoins.find((item: any) =>
        item.id.account === filter_coinAddress_owner && item.id.symbol === res_coin.name && item.wallets.find((wallet: any) => wallet === account?.address)
      )
      if (exist_coin) {
        let listed_amount = 0
        for (let i = 0; i < exist_coin?.wallets.length; i++) {
          if (exist_coin.wallets[i] === account?.address) {
            listed_amount = exist_coin.lists[i].amount / (Math.pow(10, res_coin.decimals));
          }
        }
        setListedAmount(listed_amount)
        if (listed_amount > 0) {
          setCoinUpdateStatus(true)
        }
      }

      const yourWallet = res_coin?.balance / (Math.pow(10, res_coin.decimals))
      setYourWallet(yourWallet)

      setShowTokenDetails({ ...res_coin, coinAddressName: res_coin.coinAddress.split('::')[0] })
      setShowTokenInfo(true)
      setLoading(false)
    } else {
      setShowTokenInfo(false)
    }

  }

  const handleListCoin = async () => {
    try {
      const send_id = marketCoinLists && marketCoinLists.findIndex((item: any) =>
        item.id.account === showTokenDetails.coinAddress.split('::')[0]
      )

      if (coinPrice <= 0 || amount <= 0) {
        toast.error('Price value is bigger than 0')
        return
      }
      setLoading(true)

      const tx = await createList(
        showTokenDetails?.coinAddress,
        marketCoinLists.length > 0 ? send_id : 0,
        amount * Math.pow(10, showTokenDetails?.decimals),
        coinPrice
      )
      console.log('tx', tx)
      const result = await signAndSubmitTransaction(tx);
      if (result) {
        toast.success('Succeesfully coin listed')
        setListedAmount(Number(listedAmount) + Number(amount))
        setYourWallet(Number(yourWallet) - Number(amount))
        setCoinUpdateStatus(true)
      } else {
        setLoading(false)
      }
      setLoading(false)

    } catch (error) {
      console.log('error', error)
      setLoading(false)

    }
  }

  const handleUpdateCoin = async () => {
    try {
      const send_id = marketCoinLists.findIndex((item: any) =>
        item.id.account === showTokenDetails.coinAddress.split('::')[0]
      )

      if (coinPrice <= 0) {
        return
      }
      setLoading(true)
      const tx = await updateList(
        showTokenDetails?.coinAddress,
        send_id,
        coinPrice
      )
      const result = await signAndSubmitTransaction(tx);
      if (result) {
        toast.success('Coin Price is Updated')
      } else {
        setLoading(false)
      }
      setLoading(false)

    } catch (error) {
      console.log('error')
      setLoading(false)
    }
  }

  const handleCancelCoin = async () => {
    try {
      setLoading(true)
      const send_id = marketCoinLists.findIndex((item: any) =>
        item.id.account === showTokenDetails.coinAddress.split('::')[0]
      )

      const tx = await cancelList(
        showTokenDetails?.coinAddress,
        send_id
      )
      const result = await signAndSubmitTransaction(tx);
      if (result) {
        setAmount(amount + listedAmount)
        setYourWallet(amount + yourWallet)
        setCoinUpdateStatus(false)
      } else {
        setLoading(false)
      }

      setLoading(false)

    } catch (error) {
      console.log('error', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    (
      async () => {
        try {
          setShowModal(false)
          setCoinUpdateStatus(false)
          if (!connected || !account) return;
          setLoading(true)
          setShowTokenInfo(false)
          const get_resource: any = await getResources();
          setFeeAmount(Number(get_resource.config?.data.fee) / 1000)

          const get_coins: any = await getCoins(account?.address);
          setCoinLists(get_coins)

          const get_marketCoins: any = await getMarketCoins();
          let filter_marketCoins: any = []
          let amount_array: any = []
          for (let i = 0; i < get_marketCoins.length; i++) {
            for (let j = 0; j < get_coins.length; j++) {
              if (get_marketCoins[i].id.account === get_coins[j].coinAddress.split('::')[0]) {
                get_coins[j].supply = get_marketCoins[i].id.supply
                filter_marketCoins.push(get_marketCoins[i])
              }
            }
          }
          for (let s = 0; s < filter_marketCoins.length; s++) {
            for (let i = 0; i < filter_marketCoins[s].wallets.length; i++) {
              for (let j = 0; j < get_coins.length; j++) {
                if (filter_marketCoins[s].wallets[i] === account?.address) {
                  get_coins[j].lists = filter_marketCoins[s].lists[i]
                }
              }
            }
          }

          filter_marketCoins[0]?.lists.map((item: any) => {
            return Number(item.amount) > 0 && amount_array.push(Number(item.price) / APTOS_DECIMAL)
          })
          const get_floorPrice = Math.min.apply(Math, amount_array)
          setFloorPrice(get_floorPrice !== Infinity ? get_floorPrice : 0)
          setMarketCoinLists(get_marketCoins)

          setLoading(false)
        } catch (error) {
          console.log('error', error)
          setLoading(false)
        }
      }
    )()
  }, [account, connected])


  return (
    <>
      {showModal ? (
        <>
          {
            isLoading ?
              <div id="preloader"></div> :
              <div id="preloader" style={{ display: "none" }}></div>
          }
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto">
              {/*content*/}
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="tokenListModalHeader modalHeader p-5 border-b border-solid border-slate-200 rounded-t relative">
                  <h3 className="text-white font-medium text-2xl">
                    List Your Tokens
                  </h3>
                  <ModalCloseIcon
                    className="modalCloseIcon"
                    onClick={() => {
                      navigate(location.pathname);
                      setShowModal(false);
                      setShowTokenInfo(false)
                    }}
                  />
                </div>
                <div className="relative tokenListModalContentContainer rounded-b-lg flex-auto px-5 py-3 pb-6">
                  <div>
                    <label
                      htmlFor="countries"
                      className="block mb-2 font-medium text-white font-medium text-xl"
                    >
                      Choose Listing Currency
                    </label>
                    <select
                      id="countries"
                      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-2/4 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    >
                      <option value="US">APTOS</option>
                    </select>
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-xl">
                      Fee Status
                    </h3>
                    <h3 className="titleTokenListModal font-small text-xl">
                      {feeAmount} %
                    </h3>
                  </div>
                  <div>
                    <label
                      htmlFor="countries"
                      className="block mb-2 font-medium text-white font-medium text-xl"
                    >
                      Choose Token
                    </label>
                    <select
                      onChange={(e: any) => handleTokenChange(e.target.value)}
                      placeholder="Select token from the list"
                      id="countries"
                      className="bg-white text-sm rounded-lg w-full p-2 text-orange-600 font-medium"
                    >
                      <option value='Select List' >Select token from the list</option>
                      {
                        coinLists.map((item: any, idx: any) => {
                          const coinAddress = item.coinAddress.split('::')[0]
                          return (
                            <option value={item.name} key={idx} >{coinAddress?.substr(0, 6) + '...' + coinAddress?.substr(coinAddress.length - 4, 4)}</option>

                          )
                        }
                        )
                      }
                    </select>
                  </div>
                  {/* {
                    showTokenDetails && coinLists.filter((item: any) => item.name === showTokenDetails.name )
                  } */}
                  {showTokenInfo && (
                    <div className="border p-4 my-2 rounded text-white">
                      <div className="text-3xl titleTokenListModal font-bold">
                        {account?.address.substr(0, 6) + "..." + account?.address.substr(account?.address.length - 6, 6)}
                      </div>
                      <div>
                        <h5 className="font-semibold titleTokenListModal">
                          Token Address
                        </h5>
                        <span>{showTokenDetails?.coinAddressName?.substr(0, 6) + "..." + showTokenDetails?.coinAddressName?.substr(showTokenDetails?.coinAddressName?.length - 6, 6)}</span>
                      </div>
                      <div className="">
                        <div className="flex justify-between">
                          <div>
                            <h5 className="font-semibold titleTokenListModal">
                              Max Supply
                            </h5>
                            <span>{showTokenDetails?.supply?.vec ? showTokenDetails?.supply?.vec : 0}</span>
                          </div>
                          <div>
                            <h5 className="font-semibold titleTokenListModal">
                              Your wallet
                            </h5>
                            <span>{Number(yourWallet).toFixed(2)}</span>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-semibold titleTokenListModal">
                            Floor Listing
                          </h5>
                          <span>{floorPrice.toFixed(3)} APTOS</span>
                        </div>
                      </div>
                      <div className="flex mt-2">
                        <div>
                          <h3 className="text-white titleTokenListModal font-medium text-sm">
                            Price Per Token (APTOS)
                          </h3>
                          <input
                            type={`number`}
                            value={coinPrice}
                            onChange={(e: any) => setCoinPrice(e.target.value)}
                            defaultValue="APTOS"
                            id="countries"
                            className="bg-gray-50 mr-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-3/4 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          ></input>
                        </div>
                        <div>
                          <h3 className="text-white titleTokenListModal font-medium text-sm">
                            Amount of Tokens
                          </h3>
                          <input
                            type={`number`}
                            value={amount}
                            onChange={(e: any) => setAmount(e.target.value)}
                            // defaultValue={10}
                            id="countries"
                            className="bg-gray-50 mr-2 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-3/4 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                          ></input>
                        </div>
                        {
                          coinUpdateStatus && <div>
                            <h3 className="text-white titleTokenListModal font-medium text-sm">
                              Listed Amount
                            </h3>
                            <span>{listedAmount.toFixed(2)}</span>
                          </div>
                        }
                      </div>

                      {
                        coinUpdateStatus ?
                          <div className="flex justify-center gap-2">
                            <button className="bg-transparent border hover:bg-gray-700 text-white font-medium mt-4 py-2 px-4 rounded-full" onClick={handleListCoin} >
                              LIST TOKENS
                            </button>
                            <button className="bg-transparent border hover:bg-gray-700 text-white font-medium mt-4 py-2 px-4 rounded-full" onClick={handleUpdateCoin} >
                              UPDATE TOKENS
                            </button>
                            <button className="bg-transparent border hover:bg-gray-700 text-white font-medium mt-4 py-2 px-4 rounded-full" onClick={handleCancelCoin} >
                              CANCEL TOKENS
                            </button>
                          </div>
                          :
                          <div className="flex justify-center">
                            <button className="bg-transparent border hover:bg-gray-700 text-white font-medium mt-4 py-2 px-4 rounded-full" onClick={handleListCoin} >
                              LIST TOKENS
                            </button>
                          </div>

                      }

                    </div>
                  )}
                  <div className="flex justify-center" >
                    <button className="bg-transparent border hover:bg-gray-700 text-white font-medium mt-4 py-2 px-4 rounded-full">
                      Famous fox federation is only proving access to this
                      utility
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-60 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
}

