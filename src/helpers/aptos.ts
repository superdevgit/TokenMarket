import { WalletClient, AptosClient, TokenClient, CoinClient } from "@martiandao/aptos-web3-bip44.js";
import axios from 'axios'
import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

import copy from 'copy-to-clipboard'
import { APTOS_DECIMAL, PERCENT_MULTIPLIER } from "../constants";
import CONFIG from "../config";
import { toast } from "react-hot-toast";

const { RPC, FAUCET_URL, CONTRACT_ADDRESS, MODULE, INITALIZE_FEE_VALUE } = CONFIG;

export const walletClient = new WalletClient(RPC, FAUCET_URL);
export const aptosClient = new AptosClient(RPC);
export const tokenClient = new TokenClient(aptosClient);
export const apolloClient = new ApolloClient({
  uri: CONFIG.INDEXER_URL,
  cache: new InMemoryCache()
});

export const getTokens = async (address: string) => {
  let tokens: any[] = [];
  try {
    const data = await walletClient.getTokenIds(
      address,
      1000,
      0,
      0
    );
    tokens = await Promise.all(
      data.tokenIds
        .filter((i) => i.difference != 0)
        .map(async (i) => {
          const token = await walletClient.getToken(i.data);
          const image = await getImage(token.uri);
          return {
            propertyVersion: i.data.property_version,
            creator: i.data.token_data_id.creator,
            collection: token.collection,
            name: token.name,
            description: token.description,
            uri: token.uri,
            image,
            maximum: token.maximum,
            supply: token.supply,
          };
        })
    );
  }
  catch (error) {
    console.log('error', error)
  }
  return tokens;
}

export const getRecentTrades = async (creation_number: any, address: any) => {
  try {
    const recent_trades = await aptosClient.getEventsByCreationNumber(address, creation_number);
    return recent_trades

  } catch (error) {
    console.log('error', error)
  }
}

export const filterTokensByCollection = async (tokens: any[]) => {
  let collections: any[] = [];
  try {
    for (let i = 0; i < tokens.length; i++) {
      const index = collections.findIndex(item =>
        item.creator === tokens[i]?.creator && item?.name === tokens[i]?.collection
      );

      if (index >= 0) collections[index].nfts?.push({
        ...tokens[i],
        selected: false
      });
      else collections.push({
        creator: tokens[i]?.creator,
        name: tokens[i]?.collection,
        nfts: [{
          ...tokens[i],
          selected: false
        }]
      })

    }
  }
  catch (error) {
    console.log('error', error);
  }

  return collections;
}

const getImage = async (uri: string) => {
  let image = uri;
  try {
    const { data } = await axios.get(uri);
    if (data?.image) {
      image = data.image;
    }
  }
  catch (error) {
    console.log('error', error);
  }

  return image;
}

export const beautifyAddress = (address: string) => {
  if (!address) return null;
  return `${address.substring(0, 5)}...${address.substring(address.length - 6, address.length - 1)}`;
}

export const getResources = async () => {
  let coinMarketStore = null, config = null;
  try {
    const resources = await aptosClient.getAccountResources(CONTRACT_ADDRESS);
    config = resources.find((item) => item.type === `${CONTRACT_ADDRESS}::${MODULE}::Config`);
    coinMarketStore = resources.find((item) => item.type === `${CONTRACT_ADDRESS}::${MODULE}::CoinMarketStore`);
  }
  catch (error) {
    console.log('error', error);
  }

  return { config, coinMarketStore }
}

export const getTokensData = async (tokens: any[]) => {
  let tokensData: any[] = [];
  try {
    for (let i = 0; i < tokens.length; i++) {
      const { token_data_id: { collection, creator, name } } = tokens[i];

      const tokenData = await tokenClient.getTokenData(
        creator,
        collection,
        name
      );
      const image = await getImage(tokenData.uri);
      tokensData.push({
        ...tokens[i],
        ...tokenData,
        image,
        creator
      })
    }
  }
  catch (error) {
    console.log('error', error)
  }

  return tokensData;
}

export const getMarketCoins = async () => {
  let coins: any[] = [];
  try {
    const { coinMarketStore } = await getResources();
    if (coinMarketStore) {
      let data: any = coinMarketStore.data;
      for (let i = 0; i < parseInt(data?.count); i++) {
        try {
          let coin: any = await aptosClient.getTableItem(data?.coins?.handle, {
            key_type: `u64`,
            value_type: `${CONTRACT_ADDRESS}::${MODULE}::CoinMarket`,
            key: `${i}`
          })

          coins.push(coin);
        }
        catch (error) {
          console.log('error', error);
        }
      }
    }
  }
  catch (error) {
    console.log('error', error);
  }

  return coins;
}

// actions

export const initialize = (fee: number, addresses: string[], percents: number[]) => {
  try {
    const payload = {
      type: "entry_function_payload",
      function: `${CONTRACT_ADDRESS}::${MODULE}::initialize`,
      type_arguments: [],
      arguments: [
        fee * INITALIZE_FEE_VALUE,
        addresses,
        percents.map((percent) => percent * PERCENT_MULTIPLIER)
      ],
    };

    return payload;
  }
  catch (error) {
    console.log('error', error);
  }
}

export const updateConfig = (fee: number, addresses: string[], percents: number[]) => {
  try {
    const payload = {
      type: "entry_function_payload",
      function: `${CONTRACT_ADDRESS}::${MODULE}::update_config`,
      type_arguments: [],
      arguments: [
        fee * INITALIZE_FEE_VALUE,
        addresses,
        percents.map((percent) => percent * PERCENT_MULTIPLIER)
      ],
    };

    return payload;
  }
  catch (error) {
    console.log('error', error);
  }
}

export const createList = (coinType: string, coinId: number, amount: number, price: number) => {
  try {
    const payload = {
      type: "entry_function_payload",
      function: `${CONTRACT_ADDRESS}::${MODULE}::create_list`,
      type_arguments: [coinType],
      arguments: [
        coinId,
        amount,
        Math.ceil(price * APTOS_DECIMAL)
      ],
    };

    console.log('payLoad', payload);
    return payload;
  }
  catch (error) {
    console.log('error', error);
  }

  return null;
}

export const updateList = (coinType: string, coinId: number, price: number) => {
  try {
    const payload = {
      type: "entry_function_payload",
      function: `${CONTRACT_ADDRESS}::${MODULE}::update_list`,
      type_arguments: [coinType],
      arguments: [
        coinId,
        Math.ceil(price * APTOS_DECIMAL)
      ],
    };

    console.log('payLoad', payload);
    return payload;
  }
  catch (error) {
    console.log('error', error);
  }

  return null;
}

export const cancelList = (coinType: string, coinId: number) => {
  try {
    const payload = {
      type: "entry_function_payload",
      function: `${CONTRACT_ADDRESS}::${MODULE}::cancel_list`,
      type_arguments: [coinType],
      arguments: [
        coinId
      ],
    };

    console.log('payLoad', payload);
    return payload;
  }
  catch (error) {
    console.log('error', error);
  }

  return null;
}

export const buy = (coinType: string, coinId: number, lister: string, amount: number) => {
  try {
    const payload = {
      type: "entry_function_payload",
      function: `${CONTRACT_ADDRESS}::${MODULE}::buy`,
      type_arguments: [coinType],
      arguments: [
        coinId,
        lister,
        amount
      ],
    };

    console.log('payLoad', payload);
    return payload;
  }
  catch (error) {
    console.log('error', error);
  }

  return null;
}

export const createBuyOrder = (coinType: string, coinId: number, amount: number, price: number) => {
  try {
    const payload = {
      type: "entry_function_payload",
      function: `${CONTRACT_ADDRESS}::${MODULE}::create_buy_order`,
      type_arguments: [coinType],
      arguments: [
        coinId,
        amount,
        Math.ceil(price * APTOS_DECIMAL)
      ],
    };

    console.log('payLoad', payload);
    return payload;
  }
  catch (error) {
    console.log('error', error);
  }

  return null;
}

export const updateBuyOrder = (coinType: string, coinId: number, price: number) => {
  try {
    const payload = {
      type: "entry_function_payload",
      function: `${CONTRACT_ADDRESS}::${MODULE}::update_buy_order`,
      type_arguments: [coinType],
      arguments: [
        coinId,
        Math.ceil(price * APTOS_DECIMAL)
      ],
    };

    console.log('payLoad', payload);
    return payload;
  }
  catch (error) {
    console.log('error', error);
  }

}

export const cancelBuyOrdder = (coinType: string, coinId: number) => {
  try {
    const payload = {
      type: "entry_function_payload",
      function: `${CONTRACT_ADDRESS}::${MODULE}::cancel_order`,
      type_arguments: [coinType],
      arguments: [
        coinId,
      ],
    };

    console.log('payLoad', payload);
    return payload;
  }
  catch (error) {
    console.log('error', error);
  }

}

export const fillOrder = (coinType: string, coinId: number, buyer: string, amount: any) => {
  try {
    const payload = {
      type: "entry_function_payload",
      function: `${CONTRACT_ADDRESS}::${MODULE}::fill_order`,
      type_arguments: [coinType],
      arguments: [
        coinId,
        buyer,
        amount
      ],
    };

    console.log('payLoad', payload);
    return payload;
  }
  catch (error) {
    console.log('error', error);
  }

}

export const getCoins = async (address: any) => {
  let coins: any[] = [];
  try {
    coins = await walletClient.getCustomCoins(address);
  }
  catch (error) {
    console.log('error', error);
  }

  return coins;
}

export const hex_to_ascii = async (hex_val: any) => {
  var hex = hex_val.toString();
  var str = '';
  for (var n = 0; n < hex.length; n += 2) {
    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
  }
  return str;
}

export const copyClipBoard = (text: any) => {
  copy(text)
  toast.success(`Copied`)
}

export const getCoinInfo = async () => {
  try {
    const request = new Request(CONFIG.COIN_INFO);
    const response = await fetch(request);
    const get_coininfo = await response.json();
    return get_coininfo
  } catch (error) {
    console.log('error', error)
  }

}

export const getSupply = async (coinAddress: any) => {
  try {
    const query = gql`query MyQuery {
        coin_supply(where: {coin_type: {_eq: "${coinAddress}"}}) {
          supply
        }
      }
    `;

    const { data } = await apolloClient.query({ query });
    return data
  } catch (error) {
    console.log('error', error)
  }
}