'use strict'

const fs = require('fs')
const path = require('path')

const db = uniCloud.database()
const handlerCache = Object.create(null)

function resolveClientId(event, context) {
  return (
    event?.clientId ||
    context?.auth?.uid ||
    context?.uniIdToken?.uid ||
    context?.CLIENTID ||
    context?.CLIENT_ID ||
    context?.uid ||
    context?.OPENID ||
    context?.WX_OPENID ||
    context?.CLIENTINFO?.clientId ||
    context?.CLIENT_INFO?.clientId ||
    context?.CLIENTIP ||
    'anonymous'
  )
}

function loadHandler(api) {
  if (!/^[a-zA-Z0-9_-]+$/.test(api)) {
    throw new Error('非法的接口名称')
  }
  if (handlerCache[api]) return handlerCache[api]
  const handlerPath = path.join(__dirname, 'functions', `${api}.js`)
  if (!fs.existsSync(handlerPath)) {
    throw new Error(`未找到接口 ${api}`)
  }
  const handler = require(handlerPath)
  if (typeof handler !== 'function') {
    throw new Error(`接口 ${api} 未导出可调用函数`)
  }
  handlerCache[api] = handler
  return handler
}

exports.main = async (event, context) => {
  const { api, args = {} } = event || {}
  if (!api) {
    return { success: false, errorMessage: '缺少 api 参数' }
  }
  let handler
  try {
    handler = loadHandler(api)
  } catch (err) {
    console.error('load handler error', err)
    return { success: false, errorMessage: err.message || '接口未实现' }
  }

  const clientId = resolveClientId(event, context)

  try {
    const data = await handler(args || {}, db, clientId, context)
    return { success: true, data }
  } catch (err) {
    console.error(`api ${api} execute error`, err)
    return { success: false, errorMessage: err.message || '云函数执行异常' }
  }
}
