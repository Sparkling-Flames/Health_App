'use strict'

module.exports = async (args = {}, db, clientId) => {
  const collection = db.collection('messages')
  const { action } = args

  if (action === 'publish') {
    if (!args.content) {
      throw new Error('请输入内容')
    }
    if (!clientId) {
      throw new Error('未获取到客户端标识')
    }
    const doc = {
      content: String(args.content),
      public: true,
      createdAt: Date.now(),
      clientId
    }
    const res = await collection.add(doc)
    return { _id: res.id }
  }

  if (action === 'list') {
    const res = await collection
      .where({ public: true })
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()
    return { messages: res.data || [] }
  }

  throw new Error('未知操作')
}
