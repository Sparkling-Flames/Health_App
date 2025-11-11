'use strict'

module.exports = async (args = {}, db, clientId) => {
  const { nickname, info } = args
  if (!clientId) {
    throw new Error('未获取到客户端标识')
  }
  if (!nickname || !info) {
    throw new Error('缺少必填信息')
  }

  const formCollection = db.collection('form')
  const groupCollection = db.collection('group')

  const joined = await formCollection.where({ clientId }).limit(1).get()
  if (joined.data && joined.data.length) {
    throw new Error('已加入小组')
  }

  let groupId
  for (let i = 0; i < 5; i++) {
    const candidate = Math.floor(100000 + Math.random() * 900000)
    const { total } = await groupCollection.where({ groupId: candidate }).count()
    if (total === 0) {
      groupId = candidate
      break
    }
  }
  if (!groupId) {
    throw new Error('生成小组编号失败')
  }

  const now = Date.now()
  const groupDoc = {
    leader: String(nickname),
    info: String(info),
    member: 1,
    groupId,
    createdAt: now,
    clientId
  }
  const groupRes = await groupCollection.add(groupDoc)

  const formDoc = {
    nickname: String(nickname),
    info: String(info),
    groupId,
    isLeader: true,
    clientId,
    createdAt: now
  }
  await formCollection.add(formDoc)

  return { groupId }
}
