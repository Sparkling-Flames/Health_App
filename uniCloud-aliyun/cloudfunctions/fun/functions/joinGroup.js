'use strict'

module.exports = async (args = {}, db, clientId) => {
  const groupId = Number(args.groupId)
  const nickname = args.nickname && String(args.nickname)
  if (!clientId) {
    throw new Error('未获取到客户端标识')
  }
  if (!groupId || !nickname) {
    throw new Error('缺少必填信息')
  }

  const groupCollection = db.collection('group')
  const formCollection = db.collection('form')

  const joined = await formCollection.where({ clientId }).limit(1).get()
  if (joined.data && joined.data.length) {
    const exist = joined.data[0]
    if (exist.groupId === groupId) {
      return { groupId }
    }
    throw new Error('已加入其他小组')
  }

  const groupRes = await groupCollection.where({ groupId }).limit(1).get()
  const group = groupRes.data && groupRes.data[0]
  if (!group) {
    throw new Error('小组不存在')
  }

  const now = Date.now()
  const formDoc = {
    nickname,
    info: String(args.info || ''),
    groupId,
    isLeader: false,
    clientId,
    createdAt: now
  }
  await formCollection.add(formDoc)

  await groupCollection.doc(group._id).update({
    member: db.command.inc(1)
  })

  return { groupId }
}
