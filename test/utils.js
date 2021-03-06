// @ts-check

import {
    stringify,
    getParamStrFromObj,
} from '@/utils'
import {
    DEFAULT_KEY_PREFIX,
} from '@/constants'

export const expireTime = 3

export const TIME_OUT = 999999

export const getObjLen = obj => Object.keys(obj).length

export const getTargetKey = (prefix, syncParams = {}) =>
    DEFAULT_KEY_PREFIX + (Object.keys(syncParams).length === 0
        ? prefix
        : `${prefix}?${getParamStrFromObj(syncParams)}`
    )

export const getExpectedVal = (rawData, et = expireTime) => stringify({
    rawData,
    expires: Math.floor(Date.now() / 1000) + et,
})

export const getExpectedValBySyncFn = (rawData, et = expireTime) => stringify({
    rawData: { code: 0, data: rawData },
    expires: Math.floor(Date.now() / 1000) + et,
})

export * from '@/utils'
