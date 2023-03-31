import { useState, useEffect } from 'react'
import { useWallet } from '@manahippo/aptos-wallet-adapter'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

import { getResources, initialize, updateConfig } from '../helpers/aptos'
import CONFIG from '../config'
import { APTOS_DECIMAL, PERCENT_MULTIPLIER } from '../constants'

const Admin = () => {
  const { connected, account, signAndSubmitTransaction } = useWallet()
  const navigate = useNavigate()

  const [isLoading, setLoading] = useState(false);
  const [tokenMarketConfig, setTokenMarketConfig] = useState<any>()

  const [fee, setFee] = useState(0);
  const [address1, setAddress1] = useState('');
  const [percent1, setPercent1] = useState(0);
  const [address2, setAddress2] = useState('');
  const [percent2, setPercent2] = useState(0);

  const [initialized, setInitalized] = useState(false)

  const handleInitalize = async () => {
    try {
      if (!address1 || !address2 || !percent1 || !percent2 || percent1 + percent2 != 100) {
        toast.error("Invalid values!");
        return;
      }
      setLoading(true)
      if (tokenMarketConfig) {
        const tx = updateConfig(fee, [address1, address2], [percent1, percent2]);
        console.log('tx', tx)
        if (!tx) {
          toast.error("Transaction error");
          setLoading(false);
          return;
        }
        await signAndSubmitTransaction(tx);
        toast.success("Update config success");
        setLoading(false)
      }
      else {
        const tx = initialize(fee, [address1, address2], [percent1, percent2]);
        console.log('tx', tx)

        if (!tx) {
          toast.error("Transaction error");
          setLoading(false);
          return;
        }
        await signAndSubmitTransaction(tx);
        toast.success("Initialize config success");
        const { config } = await getResources();
        setTokenMarketConfig(config);
        setInitalized(true)
        setLoading(false)

      }
    } catch (error) {
      console.log('error', error)
      toast.error("Transaction error");
      setLoading(false)
    }
  }

  useEffect(() => {
    (
      async () => {
        try {
          if (!connected || !account || CONFIG.ADMIN !== account?.address) {
            navigate('/')
          }
          setLoading(true)
          const config: any = await getResources()
          if (config.config) {
            setInitalized(true)
            setTokenMarketConfig(config?.config)
            const { fee, royalties } = config?.config.data as any;
            setFee(parseInt(fee) / APTOS_DECIMAL);
            setAddress1(royalties[0].vault_address);
            setPercent1(parseInt(royalties[0].percent) / PERCENT_MULTIPLIER);
            setAddress2(royalties[1].vault_address);
            setPercent2(parseInt(royalties[1].percent) / PERCENT_MULTIPLIER);
          }
          setLoading(false)
        } catch (error) {
          console.log('error', error)
        }
      }
    )()
  }, [account])

  return (
    <div className="admin-page" >
      {
        isLoading &&
        <div id="preloader"></div>
      }
      <div className="admin-container" >
        <div className="admin-control" >
          <div className="grid gap-6 mb-6 w-1/2 my-0 mx-[auto]">
            <div className="w-1/2">
              <label className="block mb-2 text-sm font-medium text-gray-900 text-white">Fee</label>
              <input
                type="number"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={fee}
                onChange={e => setFee(parseFloat(e.target.value))}
              />
            </div>
            <div className="w-full">
              <label className="block mb-2 text-sm font-medium text-gray-900 text-white">Royalty1 Address</label>
              <input
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={address1}
                onChange={e => setAddress1(e.target.value)}
              />
            </div>
            <div className="w-1/2">
              <label className="block mb-2 text-sm font-medium text-gray-900 text-white">Royalty1 Percent</label>
              <input
                type="number"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={percent1}
                onChange={e => setPercent1(parseFloat(e.target.value))}
              />
            </div>
            <div className="w-full">
              <label className="block mb-2 text-sm font-medium text-gray-900 text-white">Royalty2 Address</label>
              <input
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={address2}
                onChange={e => setAddress2(e.target.value)}
              />
            </div>
            <div className="w-1/2">
              <label className="block mb-2 text-sm font-medium text-gray-900 text-white">Royalty2 Percent</label>
              <input
                type="number"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                value={percent2}
                onChange={e => setPercent2(parseFloat(e.target.value))}
              />
            </div>
            <div className="w-full flex justify-center">
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => handleInitalize()}
              >
                {initialized ? 'Update' : 'Initialize'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Admin