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
    const collection = db.collection('messages')
    const action = args.action

    if (action === 'publish') {
      if (!args.content) throw new Error('请输入内容')
      if (!clientId) throw new Error('未获取到客户端标识')
      const doc = {
        content: String(args.content),
        public: true,
        createdAt: Date.now(),
        clientId
      }
      const res = await collection.add(doc)
      return { success: true, data: { _id: res.id } }
    }

    if (action === 'list') {
      const res = await collection
        .where({ public: true })
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get()
      return { success: true, data: { messages: res.data || [] } }
    }

    throw new Error('未知操作')
  } catch (err) {
    console.error('message error', err)
    return { success: false, errorMessage: err.message || '云函数执行异常' }
  }
}
