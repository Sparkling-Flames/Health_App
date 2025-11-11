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
    const { nickname, info } = args
    if (!clientId) throw new Error('未获取到客户端标识')
    if (!nickname || !info) throw new Error('缺少必填信息')

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
    if (!groupId) throw new Error('生成小组编号失败')

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

    return { success: true, data: { groupId } }
  } catch (err) {
    console.error('createGroup error', err)
    return { success: false, errorMessage: err.message || '云函数执行异常' }
  }
}
