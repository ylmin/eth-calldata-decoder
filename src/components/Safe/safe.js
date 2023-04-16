import axios from "axios";
import { utils, BigNumber } from "ethers";


function getUrlQueryParams(url = window.location.search) {
    const params = {};
    const keys = url.match(/([^?&]+)(?==)/g);
    const values = url.match(/(?<==)([^&]*)/g);
    for (const index in keys) {
        params[keys[index]] = values[index];
    }
    return params;
}

const getChainId = (name) => {
    switch (name) {
        case "matic":
            return 137;

        default:
            return 0;
    }
};

const getSafeTransactionLink = (link) => {
    try {
        const base = `https://safe-client.safe.global/v1/chains`;
        const params = getUrlQueryParams(link);

        const chainName = link.match(/(?<=global\/).*?(?=:)/);

        if (params && params["id"] && params["safe"]) {
            const chainName = params["safe"].split(":")[0];
            const chainId = getChainId(chainName);
            return `${base}/${chainId}/transactions/${params["id"]}`;
        } else if (chainName && chainName[0]) {
            const chainId = getChainId(chainName[0]);
            return `${base}/${chainId}/transactions/${params["id"]}`;
        }
        return false;
    } catch (error) {
        return false;
    }
};

const formatTransactionDatas = (data) => {
    const parameters = data?.txData?.dataDecoded?.parameters;
    if (parameters?.length > 0 && parameters[0]?.valueDecoded?.length > 0) {
        return parameters[0]?.valueDecoded;
    }
    return [];
};

export const getSafeTransactionDatas = async (link) => {
    try {
        const url = getSafeTransactionLink(link);
        if (url) {
            const result = await axios.get(url);
            if (result.status === 200) return formatTransactionDatas(result.data);
        }
        return [];
    } catch (error) {
        console.error("getSafeTransaction : ", error);
        return [];
    }
};

const recursiveBNToString = (args) => {
    return args.map((arg) =>
        BigNumber.isBigNumber(arg)
            ? arg.toString()
            : // if arg is a struct in solidity
            arg.constructor === Array
                ? recursiveBNToString(arg)
                : arg
    );
};

const getAllPossibleDecoded = (functionsArr, calldata) => {
    let allPossibleDecoded = [];
    for (var i = 0; i < functionsArr.length; i++) {
        const fn = functionsArr[i];
        const _abi = [`function ${fn}`];

        const iface = new utils.Interface(_abi);
        try {
            let { args } = iface.parseTransaction({ data: calldata });
            allPossibleDecoded.push({
                function: fn,
                params: recursiveBNToString(args),
            });
        } catch {
            continue;
        }
    }
    return allPossibleDecoded;
};

const getOpenchainDatas = async (calldata) => {
    const selector = calldata.slice(0, 10);
    const response = await axios.get(
        "https://api.openchain.xyz/signature-database/v1/lookup",
        {
            params: {
                function: selector,
            },
        }
    );
    const results = response.data.result.function[selector].map((f) => f.name);
    if (results.length > 0) {
        // can have multiple entries with the same selector
        const allPossibleDecoded = getAllPossibleDecoded(results, calldata);
        console.log(allPossibleDecoded);
        if (allPossibleDecoded.length > 0) {
            return allPossibleDecoded;
        }
        return false
    }
    return false
}

const get4byteDatas = async (calldata) => {
    const selector = calldata.slice(0, 10);

    // from 4byte.directory
    const response = await axios.get(
        "https://www.4byte.directory/api/v1/signatures/",
        {
            params: {
                hex_signature: selector,
            },
        }
    );
    const results = response.data.results.map((f) => f.text_signature);
    if (results.length > 0) {
        // can have multiple entries with the same selector
        const allPossibleDecoded = getAllPossibleDecoded(results, calldata);
        if (allPossibleDecoded.length > 0) {
            return allPossibleDecoded;
        }
        return false
    }
    return false
}

export const decodeWithSelector = async (data) => {
    const result = await getOpenchainDatas(data)
    if (result) return result;
    return await get4byteDatas(data)
};

export function asyncPool(poolLimit, array, iteratorFn) {
    let i = 0;
    const ret = [];
    const executing = [];
    const enqueue = function () {
        // 边界处理，array为空数组
        if (i === array.length) {
            return Promise.resolve();
        }
        // 每调一次enqueue，初始化一个promise
        const item = array[i++];
        const p = Promise.resolve().then(() => iteratorFn(item, array));
        // 放入promises数组
        ret.push(p);
        // promise执行完毕，从executing数组中删除
        const e = p.then(() => executing.splice(executing.indexOf(e), 1));
        // 插入executing数字，表示正在执行的promise
        executing.push(e);
        // 使用Promise.rece，每当executing数组中promise数量低于poolLimit，就实例化新的promise并执行
        let r = Promise.resolve();
        if (executing.length >= poolLimit) {
            r = Promise.race(executing);
        }
        // 递归，直到遍历完array
        return r.then(() => enqueue());
    };
    return enqueue().then(() => Promise.all(ret));
}