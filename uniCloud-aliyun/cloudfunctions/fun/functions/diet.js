'use strict'

module.exports = async (args = {}, db, clientId) => {
  const collection = db.collection('diet')
  const now = Date.now()

  if (args.food && typeof args.calories !== 'undefined') {
    if (!args.date) {
      throw new Error('缺少日期')
    }
    if (!clientId) {
      throw new Error('未获取到客户端标识')
    }
    const doc = {
      food: String(args.food),
      calories: Number(args.calories) || 0,
      date: String(args.date),
      clientId,
      createdAt: now
    }
    const res = await collection.add(doc)
    return { _id: res.id, ...doc }
  }

  const { date } = args
  if (!date) {
    throw new Error('缺少 date 参数')
  }
  if (!clientId) {
    throw new Error('未获取到客户端标识')
  }
  const list = await collection
    .where({ clientId, date: String(date) })
    .orderBy('createdAt', 'desc')
    .get()
  return { records: list.data || [] }
}
