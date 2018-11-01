/**
 * @file: 对外暴露以下方法：
 *   1.构造函数：用于初始化 TuaStorage，建议将实例挂载到全局变量上
 *
 * 异步函数，返回 Promise
 *   2.save: 保存函数
 *   3.load: 读取函数
 *   4.clear: 清除函数
 *   5.remove: 删除函数
 *   6.getInfo: 获取信息函数
 *
 * 同步函数
 *   7.saveSync: 保存函数
 *   8.loadSync: 读取函数
 *   9.clearSync: 清除函数
 *   10.removeSync: 删除函数
 *   11.getInfoSync: 获取信息函数
 */

import { version } from '../package.json'
import {
    logger,
    negate,
    checkKey,
    jsonParse,
    getFullKey,
    getDataToSave,
    supportArrayParam,
    getParamStrFromObj,
} from './utils'
import {
    ERROR_MSG,
    SE_ERROR_MSG,
    DEFAULT_EXPIRES,
    DEFAULT_KEY_PREFIX,
} from './constants'

logger.log(`Version: ${version}`)

// 缩写常用函数
const pAll = Promise.all.bind(Promise)
const pRej = Promise.reject.bind(Promise)
const pRes = Promise.resolve.bind(Promise)
const stringify = JSON.stringify.bind(JSON)

export default class TuaStorage {
    constructor ({
        syncFnMap = {},
        whiteList = [],
        storageEngine = null, // 可传递 wx / localStorage / AsyncStorage
        defaultExpires = DEFAULT_EXPIRES,
        storageKeyPrefix = DEFAULT_KEY_PREFIX,
    } = {}) {
        this.SE = storageEngine
        this.taskList = []
        this.whiteList = whiteList
        this.syncFnMap = syncFnMap
        this.defaultExpires = defaultExpires
        this.neverExpireMark = null // 永不超时的标志
        this.storageKeyPrefix = storageKeyPrefix

        this._cache = Object.create(null)

        this.SEMap = this._getFormatedSE()

        const clearExpiredData = this._clearExpiredData.bind(this)
        // 轮询扫描缓存，清除过期数据
        setTimeout(clearExpiredData, 0)
        setInterval(clearExpiredData, 1000 * 60)
    }

    /* -- 各种对外暴露方法 -- */

    /**
     * 异步保存数据，可传递数组或单对象
     * @param {Array|Object} items
     * @param {String} items.key 前缀
     * @param {Object|String|Number} items.data 待保存数据
     * @param {Number} items.expires 超时时间（单位：秒）
     * @param {String} items.fullKey 完整关键词
     * @param {Object} items.syncParams 同步参数对象
     * @param {Boolean} items.isEnableCache 是否使用内存缓存
     * @return {Promise}
     */
    @supportArrayParam()
    @checkKey
    @getFullKey
    @getDataToSave
    save ({
        key,
        dataToSave,
        isEnableCache = true,
    }) {
        if (isEnableCache) {
            this._cache[key] = dataToSave
        }

        return this.SEMap._setItem(key, dataToSave)
    }

    /**
     * 同步保存数据，可传递数组或单对象
     * @param {Array|Object} items
     * @param {String} items.key 前缀
     * @param {Object|String|Number} items.data 待保存数据
     * @param {Number} items.expires 超时时间（单位：秒）
     * @param {String} items.fullKey 完整关键词
     * @param {Object} items.syncParams 同步参数对象
     * @param {Boolean} items.isEnableCache 是否使用内存缓存
     * @return {Promise}
     */
    @supportArrayParam()
    @checkKey
    @getFullKey
    @getDataToSave
    saveSync ({
        key,
        dataToSave,
        isEnableCache = true,
    }) {
        try {
            if (isEnableCache) {
                this._cache[key] = dataToSave
            }

            this.SEMap._setItemSync(key, dataToSave)
        } catch (err) {
            delete this._cache[key]

            throw err
        }
    }

    /**
     * 异步读取数据，可传递数组或单对象
     * @param {Array|Object} items
     * @param {String} items.key 前缀
     * @param {Function} items.syncFn 同步数据的方法
     * @param {String} items.fullKey 完整关键词
     * @param {Object} items.syncParams 同步参数对象
     * @param {Number} items.expires 超时时间（单位：秒）
     * @param {Boolean} items.isAutoSave 是否自动保存
     * @param {Boolean} items.isEnableCache 是否使用内存缓存
     * @param {Boolean} items.isForceUpdate 是否直接调用 syncFn
     * @return {Promise}
     */
    @supportArrayParam()
    @checkKey
    @getFullKey
    load ({
        key,
        prefix,
        syncFn = this.syncFnMap[prefix],
        syncParams,
        ...rest
    }) {
        return this._findData({ key, syncFn, syncParams, ...rest })
    }

    /**
     * 同步读取数据，可传递数组或单对象
     * @param {Array|Object} items
     * @param {String} items.key 前缀
     * @param {String} items.fullKey 完整关键词
     * @param {Object} items.syncParams 同步参数对象
     * @return {Promise}
     */
    @supportArrayParam(false)
    @checkKey
    @getFullKey
    loadSync ({ key, isEnableCache = true }) {
        const cacheData = this._cache[key]

        if (isEnableCache && cacheData) {
            const { expires, rawData } = jsonParse(cacheData)
            if (!this._isDataExpired({ expires })) return rawData
        }

        const loadedData = this.SEMap._getItemSync(key)
        if (!loadedData) return undefined

        const { expires, rawData } = loadedData
        if (!this._isDataExpired({ expires })) return rawData
    }

    /**
     * 异步清除非白名单中的所有缓存数据
     * @param {String[]} whiteList 白名单
     * @return {Promise}
     */
    clear (whiteList = []) {
        // 首先清除缓存
        this._clearFromCache(whiteList)

        return this.SEMap._clear(whiteList)
    }

    /**
     * 同步清除非白名单中的所有缓存数据
     * @param {String[]} whiteList 白名单
     * @return {Promise}
     */
    clearSync (whiteList = []) {
        // 首先清除缓存
        this._clearFromCache(whiteList)

        this.SEMap._clearSync(whiteList)
    }

    /**
     * 异步删除数据，可传递数组或字符串或单对象(fullKey)
     * @param {String[]|String|Object} items
     * @param {String|Object} items.prefix 数据前缀
     * @param {String} items.prefix.fullKey 完整的数据前缀
     * @return {Promise}
     */
    @supportArrayParam()
    @checkKey
    remove (prefix) {
        const fullKey = typeof prefix === 'object'
            ? prefix.fullKey
            : ''

        const key = fullKey || this.storageKeyPrefix + prefix
        delete this._cache[key]

        return this.SEMap._removeItem(key)
    }

    /**
     * 同步删除数据，可传递数组或字符串或单对象(fullKey)
     * @param {String[]|String|Object} items
     * @param {String|Object} items.prefix 数据前缀
     * @param {String} items.prefix.fullKey 完整的数据前缀
     * @return {Promise}
     */
    @supportArrayParam()
    @checkKey
    removeSync (prefix) {
        const fullKey = typeof prefix === 'object'
            ? prefix.fullKey
            : ''
        const key = fullKey || this.storageKeyPrefix + prefix

        delete this._cache[key]
        this.SEMap._removeItemSync(key)
    }

    /**
     * 异步获取当前 storage 的相关信息
     * @return {Promise}
     */
    getInfo () {
        return this.SEMap._getInfo()
    }

    /**
     * 同步获取当前 storage 的相关信息
     * @return {Promise}
     */
    getInfoSync () {
        return this.SEMap._getInfoSync()
    }

    /* -- 各种私有方法 -- */

    _getAllCacheKeys () {
        return Object.keys(this._cache)
    }

    /**
     * 清除 cache 中非白名单中的数据
     * @param {String[]} whiteList 白名单
     */
    _clearFromCache (whiteList) {
        const allCacheKeys = this._getAllCacheKeys()

        this._getKeysByWhiteList(whiteList)(allCacheKeys)
            .forEach(key => { delete this._cache[key] })
    }

    /**
     * 清除 cache 中已过期的数据
     */
    _clearExpiredDataFromCache () {
        this._getAllCacheKeys()
            .filter(key => this._isDataExpired(this._cache[key]))
            .map(key => { delete this._cache[key] })
    }

    /**
     * 清除已过期的数据
     */
    _clearExpiredData () {
        const { _getItem, _getAllKeys, _removeItem } = this.SEMap

        // 清除 cache 中过期数据
        this._clearExpiredDataFromCache()

        return _getAllKeys()
            .then((keys) => keys
                .map((key) => _getItem(key)
                    .then(jsonParse)
                    // 不处理 JSON.parse 的错误
                    .catch(() => {})
                    .then(this._isDataExpired.bind(this))
                    .then(isExpired => isExpired ? _removeItem(key) : pRes())
                )
            )
            .then(pAll)
    }

    /**
     * 从 cache 中寻找数据，如果没寻找到则读取 storage
     * @param {Object} item
     * @param {String} item.key 前缀
     * @param {Boolean} item.isEnableCache 是否启用 cache
     * @param {Boolean} item.isForceUpdate 是否直接调用 syncFn
     * @return {Promise}
     */
    _findData ({
        key,
        isEnableCache = true,
        isForceUpdate = false,
        ...rest
    }) {
        // 忽略缓存直接去同步数据
        if (isForceUpdate) {
            return this._loadData({ key, ...rest })
        }

        const cacheData = this._cache[key]

        return (isEnableCache && cacheData)
            // 返回 cache 数据
            ? this._loadData({ key, cacheData, ...rest })
            // 读取 storage
            : this.SEMap._getItem(key)
                // 如果有缓存则返回 cacheData
                .then(cacheData => this._loadData({ key, cacheData, ...rest }))
                // 没有缓存则不传 cacheData，执行同步数据逻辑（请求接口等）
                .catch(() => this._loadData({ key, ...rest }))
    }

    /**
     * 统一规范化 AsyncStorage 的各个方法
     * @return {Object}
     */
    _formatMethodsByAS () {
        const {
            getItem,
            setItem,
            getAllKeys,
            removeItem,
            multiRemove,
        } = this.SE

        const bindFnToSE = fn => fn.bind(this.SE)
        const throwSyncError = () => {
            throw Error(ERROR_MSG.SYNC_METHOD)
        }

        const _clear = (whiteList) => (
            _getAllKeys()
                .then(this._getKeysByWhiteList(whiteList))
                .then(bindFnToSE(multiRemove))
                .catch(logger.error)
        )
        const _getItem = bindFnToSE(getItem)
        const _setItem = bindFnToSE(setItem)
        const _getAllKeys = bindFnToSE(getAllKeys)
        const _removeItem = bindFnToSE(removeItem)
        const _getInfo = () => _getAllKeys().then(keys => ({ keys }))

        const _clearSync = throwSyncError
        const _getItemSync = throwSyncError
        const _setItemSync = throwSyncError
        const _getInfoSync = throwSyncError
        const _removeItemSync = throwSyncError

        return { _clear, _getItem, _setItem, _getInfo, _getAllKeys, _removeItem, _clearSync, _getItemSync, _setItemSync, _getInfoSync, _removeItemSync }
    }

    /**
     * 统一规范化 LocalStorage 的各个方法
     * @return {Object}
     */
    _formatMethodsByLS () {
        const { getItem, setItem, removeItem } = this.SE

        const promisify = (fn) => (...args) => pRes(
            fn.apply(this.SE, args)
        )

        const _clear = (whiteList) => {
            const mergedWhiteList = [ ...whiteList, ...this.whiteList ]
            const isNotInWhiteList = key => mergedWhiteList
                .every(item => !key.includes(item))

            return _getAllKeys()
                .then(keys => keys.filter(isNotInWhiteList))
                .then(keys => keys.map(k => _removeItem(k)))
                .then(pAll)
                .catch(logger.error)
        }
        const _getItem = promisify(getItem)
        const _setItem = (key, data) => promisify(setItem)(key, stringify(data))
        const _getAllKeys = () => pRes(_getAllKeysSync())
        const _removeItem = promisify(removeItem)
        const _getInfo = () => ({ keys: _getAllKeysSync() })

        const _clearSync = (whiteList) => {
            const allKeys = _getAllKeysSync()

            this._getKeysByWhiteList(whiteList)(allKeys)
                .map(_removeItemSync)
        }
        const _getItemSync = (key) => jsonParse(this.SE.getItem(key))
        const _setItemSync = (key, data) => this.SE.setItem(key, stringify(data))
        const _getInfoSync = () => ({ keys: _getAllKeysSync() })
        const _removeItemSync = removeItem.bind(this.SE)
        const _getAllKeysSync = () => {
            const { key: keyFn, length } = this.SE
            const keys = []

            for (let i = 0, len = length; i < len; i++) {
                const key = keyFn.call(this.SE, i)
                keys.push(key)
            }

            return keys
        }

        return { _clear, _getItem, _getInfo, _setItem, _getAllKeys, _removeItem, _clearSync, _getItemSync, _setItemSync, _getInfoSync, _removeItemSync }
    }

    /**
     * 统一规范化小程序的各个方法
     * @return {Object}
     */
    _formatMethodsByWX () {
        const {
            getStorage,
            setStorage,
            removeStorage,
            getStorageInfo,
        } = this.SE

        const promisify = (fn) => (args = {}) => new Promise(
            (success, fail) => fn.call(
                this.SE,
                { fail, success, ...args }
            )
        )

        const rmFn = promisify(removeStorage)
        const getFn = promisify(getStorage)
        const setFn = promisify(setStorage)

        const _clear = (whiteList) => (
            _getAllKeys()
                .then(this._getKeysByWhiteList(whiteList))
                .then((keys) => keys.map(_removeItem))
                .then(pAll)
        )
        const _setItem = (key, data) => setFn({ key, data })
        const _getItem = key => getFn({ key }).then(({ data }) => data)
        const _removeItem = key => rmFn({ key })
        const _getAllKeys = () => _getInfo().then(({ keys }) => keys)
        const _getInfo = promisify(getStorageInfo)

        const _clearSync = (whiteList) => {
            const allKeys = _getAllKeysSync()

            this._getKeysByWhiteList(whiteList)(allKeys)
                .map(_removeItemSync)
        }
        const _getItemSync = this.SE.getStorageSync
        const _setItemSync = this.SE.setStorageSync
        const _getInfoSync = this.SE.getStorageInfoSync
        const _getAllKeysSync = () => _getInfoSync().keys
        const _removeItemSync = this.SE.removeStorageSync

        return { _clear, _setItem, _getItem, _getInfo, _getAllKeys, _removeItem, _clearSync, _setItemSync, _getItemSync, _getInfoSync, _removeItemSync }
    }

    /**
     * 统一规范化 wx、localStorage、AsyncStorage 三种存储引擎的调用方法
     * @return {Object | Null}
     */
    _getFormatedSE () {
        const noop = () => {}
        const _getInfoSync = () => ({ keys: this._getAllCacheKeys() })

        const defaultSEMap = {
            _clear: pRes,
            _setItem: pRes,
            _getItem: pRes,
            _getInfo: () => pRes(_getInfoSync()),
            _getAllKeys: () => pRes([]),
            _removeItem: pRes,

            _clearSync: noop,
            _getInfoSync,
            _getItemSync: noop,
            _setItemSync: noop,
            _removeItemSync: noop,
        }

        // 未指定存储引擎
        if (!this.SE) {
            logger.warn(SE_ERROR_MSG)

            return defaultSEMap
        }

        const SEMethods = {
            wx: [
                'setStorage',
                'getStorage',
                'removeStorage',
                'getStorageInfo',
                'getStorageInfoSync',
            ],
            ls: ['getItem', 'setItem', 'removeItem'],
            as: ['getItem', 'setItem', 'multiRemove'],
        }

        const isSEHasThisProp = p => !!this.SE[p]

        const isWX = SEMethods.wx.every(isSEHasThisProp)

        // 当前是支持所有必需小程序 api 的环境
        if (isWX) return this._formatMethodsByWX()

        // 部分必需 api 不存在
        const missedLSApis = SEMethods.ls.filter(negate(isSEHasThisProp))
        const missedASApis = SEMethods.as.filter(negate(isSEHasThisProp))
        const missedWXApis = SEMethods.wx.filter(negate(isSEHasThisProp))

        const requiredApisNotFound =
            missedLSApis.length &&
            missedASApis.length &&
            missedWXApis.length

        if (requiredApisNotFound) {
            const displayMissingApis = (apis) =>
                logger.warn(`Missing required apis:\n* ${apis.join('\n* ')}`)

            missedLSApis.length && displayMissingApis(missedLSApis)
            missedASApis.length && displayMissingApis(missedASApis)
            missedWXApis.length && displayMissingApis(missedWXApis)

            logger.warn(SE_ERROR_MSG)
        }

        try {
            const promiseTest = this.SE.setItem('test', 'test')
            this.SE.removeItem('test')
            const isPromise = !!(promiseTest && promiseTest.then)

            return isPromise
                ? this._formatMethodsByAS()
                : this._formatMethodsByLS()
        } catch (e) {
            return defaultSEMap
        }
    }

    /**
     * 获取过滤白名单后的 keys
     * @param {String[]} whiteList 白名单
     * @return {Function}
     */
    _getKeysByWhiteList (whiteList) {
        const mergedWhiteList = [
            ...whiteList,
            ...this.whiteList,
        ]

        return keys => keys.filter(
            key => mergedWhiteList
                .every(item => key.indexOf(item) === -1)
        )
    }

    /**
     * 根据前缀和同步参数，获取完整请求关键词字符串
     * @param {String} prefix 前缀
     * @param {Object} syncParams 同步参数对象
     * @return {String} 完整请求关键词字符串
     */
    _getQueryKeyStr ({ prefix, syncParams }) {
        return this.storageKeyPrefix + (
            Object.keys(syncParams).length === 0
                ? prefix
                : `${prefix}?${getParamStrFromObj(syncParams)}`
        )
    }

    /**
     * 读取数据函数：
     * 1.如果参数中传了 cacheData，且数据未过期则返回缓存数据（可能来自 cache 或者 storage）
     * 2.如果没有缓存数据或已过期，同时也没有对应的同步数据的方法，那么抛出错误
     * 3.调用同步数据方法
     * @param {Object} item
     * @param {String} item.key 前缀
     * @param {Function} item.syncFn 同步数据的方法
     * @param {Number} item.expires 超时时间（单位：秒）
     * @param {Object} item.cacheData 缓存数据
     * @param {Object} item.syncParams 同步参数对象
     * @param {Boolean} item.isAutoSave 是否自动保存
     * @return {Promise}
     */
    _loadData ({
        key,
        syncFn,
        expires,
        cacheData,
        syncParams,
        isAutoSave = true,
    }) {
        const isNoCacheData = cacheData === null || cacheData === undefined

        const syncResolveFn = () => {
            const getSameKey = ({ key: taskKey }) => taskKey === key
            const sameTask = this.taskList.find(getSameKey)
            const finallyRemoveTask = (err) => {
                this.taskList = this.taskList.filter(negate(getSameKey))

                if (err) {
                    logger.error(err)

                    return Promise.reject(err)
                }
            }

            // 如果有相同的任务，则共用该任务
            if (sameTask) return sameTask.task

            const originTask = syncFn(syncParams)
            const isPromise = !!(originTask && originTask.then)

            if (!isPromise) return pRej(Error(ERROR_MSG.PROMISE))

            // 格式化数据结构
            const formatDataStructure = (data) => (data.code == null && data.data == null)
                ? { data }
                : data

            // 格式化数据类型
            const formatDataType = ({ code = 0, data }) => ({ code: +code, data })

            const task = originTask
                .then(formatDataStructure)
                .then(formatDataType)
                .then(({ code, data }) => {
                    // 应该首先删除任务
                    finallyRemoveTask()

                    if (code !== 0 || !isAutoSave) return { code, data }

                    this.save({
                        // 防止无限添加前缀
                        key: key.replace(this.storageKeyPrefix, ''),
                        data: { code, data },
                        expires,
                    }).catch(logger.error)

                    return { code, data }
                })
                .catch(finallyRemoveTask)

            this.taskList.push({ key, task })

            return task
        }

        const syncRejectFn = () => pRej(Error(stringify({ key, syncFn })))

        // 没有缓存数据，直接调用方法同步数据
        if (isNoCacheData) {
            return syncFn ? syncResolveFn() : syncRejectFn()
        }

        // cacheData 转为对象
        cacheData = jsonParse(cacheData)

        const { expires: cacheExpires, rawData } = cacheData
        const isDataExpired = this._isDataExpired({ expires: cacheExpires })

        // 若数据未过期，则直接用缓存数据，
        // 否则调用同步数据函数，若没有同步函数则返回错误
        return isDataExpired
            ? !syncFn
                ? syncRejectFn()
                : syncResolveFn()
            : pRes(rawData)
    }

    /**
     * 判断数据是否已过期
     * @param {Object} param
     * @param {Number} param.expires 数据的到期时间
     * @return {Boolean}
     */
    _isDataExpired (param) {
        // 不处理数据结构不匹配的数据
        if (!param) return false

        const { expires = this.neverExpireMark } = param

        return this._isNeverExpired(expires)
            // 永不超时
            ? false
            : +expires < parseInt(Date.now() / 1000)
    }

    /**
     * 判断是否永不超时
     * @param {Number} expires
     * @return {Boolean}
     */
    _isNeverExpired (expires) {
        return expires === this.neverExpireMark
    }
}
