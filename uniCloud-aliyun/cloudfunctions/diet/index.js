'use strict'

const db = uniCloud.database()

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

exports.main = async (event, context) => {
  const args = event || {}
  const clientId = resolveClientId(event, context)
  try {
    const collection = db.collection('diet')
    const now = Date.now()

    if (args.food && typeof args.calories !== 'undefined') {
      if (!args.date) throw new Error('缺少日期')
      if (!clientId) throw new Error('未获取到客户端标识')
      const doc = {
        food: String(args.food),
        calories: Number(args.calories) || 0,
        date: String(args.date),
        clientId,
        createdAt: now
      }
      const res = await collection.add(doc)
      return { success: true, data: { _id: res.id, ...doc } }
    }

    const { date } = args
    if (!date) throw new Error('缺少 date 参数')
    if (!clientId) throw new Error('未获取到客户端标识')
    const list = await collection
      .where({ clientId, date: String(date) })
      .orderBy('createdAt', 'desc')
      .get()
    return { success: true, data: { records: list.data || [] } }
  } catch (err) {
    console.error('diet error', err)
    return { success: false, errorMessage: err.message || '云函数执行异常' }
  }
}
