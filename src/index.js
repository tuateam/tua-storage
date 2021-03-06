/**
 * @file: 对外暴露以下方法：
 *   1.构造函数：用于初始化 TuaStorage
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
    pAll,
    pRej,
    pRes,
    logger,
    negate,
    checkKey,
    jsonParse,
    stringify,
    getFullKey,
    getDataToSave,
    syncArrayParams,
    asyncArrayParams,
    getParamStrFromObj,
} from './utils'
import {
    ERROR_MSGS,
    DEFAULT_EXPIRES,
    DEFAULT_KEY_PREFIX,
    REQUIRED_SE_METHODS,
} from './constants'
import formatMethodsByAS from './storageEngines/asyncStorage'
import formatMethodsByLS from './storageEngines/localStorage'
import formatMethodsByWX from './storageEngines/wxStorage'

logger.log(`Version: ${version}`)

class TuaStorage {
    /**
     * @param {object} [args]
     * @param {string[]} [args.whiteList = []] 白名单数组
     * @param {object} [args.syncFnMap = {}] 同步函数对象
     * @param {object} [args.storageEngine = null] 存储引擎
     * @param {number} [args.defaultExpires = DEFAULT_EXPIRES] 默认过期时间
     * @param {any} [args.neverExpireMark = null] 永不过期的标志
     * @param {string} [args.storageKeyPrefix = DEFAULT_KEY_PREFIX] 默认存储前缀
     * @param {number} [args.autoClearTime = 60] 默认自动清理时间
     * @param {boolean} [args.isEnableAutoClear = true] 是否自动清理过期数据
     */
    constructor ({
        whiteList = [],
        syncFnMap = Object.create(null),
        storageEngine = null,
        defaultExpires = DEFAULT_EXPIRES,
        neverExpireMark = null,
        storageKeyPrefix = DEFAULT_KEY_PREFIX,

        // auto clear
        autoClearTime = 60, // 默认1分钟，以秒为单位
        isEnableAutoClear = true,
    } = {}) {
        this.SE = storageEngine
        this.taskList = []
        this.whiteList = whiteList
        this.syncFnMap = syncFnMap
        this.defaultExpires = defaultExpires
        this.neverExpireMark = neverExpireMark
        this.storageKeyPrefix = storageKeyPrefix

        // 内存缓存
        this._cache = Object.create(null)

        // 根据 SE 获取各种适配好的方法对象
        this.SEMethods = this._getSEMethods()

        // 轮询扫描缓存，清除过期数据
        if (isEnableAutoClear) {
            const clearExpiredData = this._clearExpiredData.bind(this)
            setTimeout(clearExpiredData, 0)
            setInterval(clearExpiredData, autoClearTime * 1000)
        }
    }

    /* -- 各种对外暴露方法 -- */

    /**
     * 异步保存数据，可传递数组或单对象
     * @param {object} item 可以是(`object|object[]`)
     * @param {string} [item.key] 前缀
     * @param {any} item.data 待保存数据
     * @param {number} [item.expires] 超时时间（单位：秒）
     * @param {string} [item.fullKey] 完整关键词
     * @param {object} [item.syncParams] 同步参数对象
     * @param {boolean} [item.isEnableCache = true] 是否使用内存缓存
     * @param {object} [item.dataToSave]
     * @param {any} item.dataToSave.rawData 待保存数据
     * @param {number} item.dataToSave.expires 超时时间（单位：秒）
     * @return {Promise}
     */
    @asyncArrayParams
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

        return this.SEMethods._setItem(key, dataToSave)
    }

    /**
     * 同步保存数据，可传递数组或单对象
     * @param {object} item 可以是(`object|object[]`)
     * @param {string} item.key 前缀
     * @param {any} item.data 待保存数据
     * @param {number} item.expires 超时时间（单位：秒）
     * @param {string} item.fullKey 完整关键词
     * @param {object} item.syncParams 同步参数对象
     * @param {boolean} [item.isEnableCache = true] 是否使用内存缓存
     * @param {object} [item.dataToSave]
     * @param {any} item.dataToSave.rawData 待保存数据
     * @param {number} item.dataToSave.expires 超时时间（单位：秒）
     */
    @asyncArrayParams
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

            this.SEMethods._setItemSync(key, dataToSave)
        } catch (err) {
            delete this._cache[key]

            throw err
        }
    }

    /**
     * 异步读取数据，可传递数组或单对象
     * @param {object} item 可以是(`object|object[]`)
     * @param {string} item.key 前缀
     * @param {function} [item.syncFn] 同步数据的方法
     * @param {string} [item.fullKey] 完整关键词
     * @param {object} [item.syncParams] 同步参数对象
     * @param {number} [item.expires] 超时时间（单位：秒）
     * @param {boolean} [item.isAutoSave] 是否自动保存
     * @param {boolean} [item.isEnableCache] 是否使用内存缓存
     * @param {boolean} [item.isForceUpdate] 是否直接调用 syncFn
     * @param {string} item.prefix 由 `@getFullKey` 生成（也就是原始的 key，而 key 变成了完整的 key）
     * @return {Promise}
     */
    @asyncArrayParams
    @checkKey
    @getFullKey
    load ({
        key,
        prefix,
        syncFn = this.syncFnMap[prefix],
        ...rest
    }) {
        return this._findData({ key, syncFn, ...rest })
    }

    /**
     * 同步读取数据，可传递数组或单对象
     * @param {object} item
     * @param {string} item.key 前缀
     * @param {string} item.fullKey 完整关键词
     * @param {object} item.syncParams 同步参数对象
     * @param {boolean} [item.isEnableCache = true] 是否使用内存缓存
     */
    @syncArrayParams
    @checkKey
    @getFullKey
    loadSync ({ key, isEnableCache = true }) {
        const cacheData = this._cache[key]
        const loadedData = (isEnableCache && cacheData)
            ? cacheData
            : this.SEMethods._getItemSync(key)

        // 没有数据直接返回 undefined
        if (!loadedData) return undefined

        // 数据未过期才返回数据
        const { expires, rawData } = jsonParse(loadedData)
        if (!this._isDataExpired({ expires })) return rawData
    }

    /**
     * 异步清除非白名单数组中的所有缓存数据
     * @param {string[]} [whiteList = []] 白名单数组
     * @return {Promise}
     */
    clear (whiteList = []) {
        // 首先清除缓存
        this._clearFromCache(whiteList)

        return this.SEMethods._clear(whiteList)
    }

    /**
     * 同步清除非白名单数组中的所有缓存数据
     * @param {string[]} [whiteList = []] 白名单数组
     */
    clearSync (whiteList = []) {
        // 首先清除缓存
        this._clearFromCache(whiteList)
        this.SEMethods._clearSync(whiteList)
    }

    /**
     * 异步删除数据，可传递数组或字符串或单对象(fullKey)
     * @param {object} prefix 数据前缀（可以是 `object|string|string[]|object[]`）
     * @param {string} [prefix.fullKey] 完整的数据前缀（对象）
     * @return {Promise}
     */
    @asyncArrayParams
    @checkKey
    remove (prefix) {
        const fullKey = typeof prefix === 'object'
            ? prefix.fullKey
            : ''

        const key = fullKey || this.storageKeyPrefix + prefix
        delete this._cache[key]

        return this.SEMethods._removeItem(key)
    }

    /**
     * 同步删除数据，可传递数组或字符串或单对象(fullKey)
     * @param {object} prefix 数据前缀（可以是 `object|string|string[]|object[]`）
     * @param {string} [prefix.fullKey] 完整的数据前缀（对象）
     */
    @syncArrayParams
    @checkKey
    removeSync (prefix) {
        const fullKey = typeof prefix === 'object'
            ? prefix.fullKey
            : ''

        const key = fullKey || this.storageKeyPrefix + prefix
        delete this._cache[key]

        this.SEMethods._removeItemSync(key)
    }

    /**
     * 异步获取当前 storage 的相关信息
     * @return {Promise}
     */
    getInfo () {
        return this.SEMethods._getInfo()
    }

    /**
     * 同步获取当前 storage 的相关信息
     * @return {Promise}
     */
    getInfoSync () {
        return this.SEMethods._getInfoSync()
    }

    /* -- 各种私有方法 -- */

    _getAllCacheKeys () {
        return Object.keys(this._cache)
    }

    /**
     * 清除 cache 中非白名单数组中的数据
     * @param {string[]} whiteList 白名单数组
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
        const { _getItem, _getAllKeys, _removeItem } = this.SEMethods

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
     * @param {object} item
     * @param {string} item.key 前缀
     * @param {function} [item.syncFn] 同步数据的方法
     * @param {boolean} [item.isEnableCache = true] 是否启用 cache
     * @param {boolean} [item.isForceUpdate = false] 是否直接调用 syncFn
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
            : this.SEMethods._getItem(key)
                // 小程序端找不到数据会进入 catch
                .catch(() => null)
                .then(cacheData => this._loadData({ key, cacheData, ...rest }))
    }

    /**
     * 统一规范化 wx、localStorage、AsyncStorage 三种存储引擎的调用方法
     * @return {object | null}
     */
    _getSEMethods () {
        const noop = () => {}
        const emptyPRes = () => pRes()
        const _getInfoSync = () => ({ keys: this._getAllCacheKeys() })

        const defaultSEMap = {
            _clear: emptyPRes,
            _setItem: emptyPRes,
            _getItem: emptyPRes,
            _getInfo: () => pRes(_getInfoSync()),
            _getAllKeys: () => pRes([]),
            _removeItem: emptyPRes,

            _clearSync: noop,
            _getInfoSync,
            _getItemSync: noop,
            _setItemSync: noop,
            _removeItemSync: noop,
        }

        // 未指定存储引擎，默认使用内存
        if (!this.SE) {
            logger.warn(ERROR_MSGS.storageEngine)

            return defaultSEMap
        }

        const isSEHasThisProp = p => !!this.SE[p]
        const isWX = REQUIRED_SE_METHODS.wx.every(isSEHasThisProp)

        // 当前是支持所有必需小程序 api 的环境
        if (isWX) return formatMethodsByWX.call(this)

        // 部分必需 api 不存在
        const missedLSApis = REQUIRED_SE_METHODS.ls.filter(negate(isSEHasThisProp))
        const missedASApis = REQUIRED_SE_METHODS.as.filter(negate(isSEHasThisProp))
        const missedWXApis = REQUIRED_SE_METHODS.wx.filter(negate(isSEHasThisProp))

        const requiredApisNotFound =
            missedLSApis.length &&
            missedASApis.length &&
            missedWXApis.length

        // 当前传入的存储引擎在各种场景下，必须方法有缺失
        if (requiredApisNotFound) {
            // 传入空对象时不展示提示
            if (JSON.stringify(this.SE) !== '{}') {
                const displayMissingApis = (apis, se) =>
                    logger.warn(`Missing required apis for ${se}:\n* ${apis.join('\n* ')}`)

                displayMissingApis(missedLSApis, 'localStorage')
                displayMissingApis(missedASApis, 'AsyncStorage')
                displayMissingApis(missedWXApis, 'wx')

                logger.warn(ERROR_MSGS.storageEngine)
            }

            return defaultSEMap
        }

        try {
            const testKey = `__TUA_STORAGE_TEST__`
            const promiseTest = this.SE.setItem(testKey, 'test')
            const isPromise = !!(promiseTest && promiseTest.then)
            this.SE.removeItem(testKey)

            return isPromise
                ? formatMethodsByAS.call(this)
                : formatMethodsByLS.call(this)
        } catch (error) {
            logger.error(error)

            return defaultSEMap
        }
    }

    /**
     * 获取过滤白名单数组后的 keys
     * @param {string[]} whiteList 白名单数组
     */
    _getKeysByWhiteList (whiteList) {
        const mergedWhiteList = [
            ...whiteList,
            ...this.whiteList,
        ]

        return (keys) => keys.filter(
            key => mergedWhiteList
                .every(item => key.indexOf(item) === -1)
        )
    }

    /**
     * 根据前缀和同步参数，获取完整请求关键词字符串
     * @param {object} item
     * @param {string} item.prefix 前缀
     * @param {object} item.syncParams 同步参数对象
     * @return {string} 完整请求关键词字符串
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
     * @param {object} item
     * @param {string} item.key 前缀
     * @param {function} [item.syncFn] 同步数据的方法
     * @param {number} [item.expires] 超时时间（单位：秒）
     * @param {object} [item.cacheData] 缓存数据
     * @param {object} [item.syncParams] 同步参数对象
     * @param {object} [item.syncOptions = []] 同步函数配置
     * @param {boolean} [item.isAutoSave = true] 是否自动保存
     * @return {Promise}
     */
    _loadData ({
        key,
        syncFn,
        expires,
        cacheData,
        syncParams,
        syncOptions = [],
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
                    return pRej(err)
                }
            }

            // 如果有相同的任务，则共用该任务
            if (sameTask) return sameTask.task

            const originTask = Array.isArray(syncOptions)
                ? syncFn(syncParams, ...syncOptions)
                : syncFn(syncParams, syncOptions)
            const isPromise = !!(originTask && originTask.then)

            if (!isPromise) return pRej(Error(ERROR_MSGS.promise))

            // 格式化数据结构和类型
            const formatData = (data) => (data.code == null && data.data == null)
                ? { code: 0, data }
                : { ...data, code: +data.code || 0 }

            const task = originTask
                .then(formatData)
                .then(({ code, ...rest }) => {
                    // 应该首先删除任务
                    finallyRemoveTask()

                    if (code !== 0 || !isAutoSave) return { code, ...rest }

                    this.save({
                        // 防止无限添加前缀
                        key: key.replace(this.storageKeyPrefix, ''),
                        data: { code, ...rest },
                        expires,
                    }).catch(logger.error)

                    return { code, ...rest }
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
            ? syncFn
                ? syncResolveFn()
                : syncRejectFn()
            : pRes(rawData)
    }

    /**
     * 判断数据是否已过期
     * @param {object} param
     * @param {number} [param.expires = this.neverExpireMark] 数据的到期时间
     * @return {boolean}
     */
    _isDataExpired (param) {
        // 不处理数据结构不匹配的数据
        if (!param) return false

        const { expires = this.neverExpireMark } = param

        return this._isNeverExpired(expires)
            // 永不超时
            ? false
            : +expires < Math.floor(Date.now() / 1000)
    }

    /**
     * 判断是否永不超时
     * @param {number} expires
     * @return {boolean}
     */
    _isNeverExpired (expires) {
        return expires === this.neverExpireMark
    }
}

TuaStorage.install = (Vue, options) => {
    Vue.prototype.$tuaStorage = new TuaStorage(options)
}

export default TuaStorage
