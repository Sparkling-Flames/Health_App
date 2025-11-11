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
    const groupId = Number(args.groupId)
    const nickname = args.nickname && String(args.nickname)
    if (!clientId) throw new Error('未获取到客户端标识')
    if (!groupId || !nickname) throw new Error('缺少必填信息')

    const groupCollection = db.collection('group')
    const formCollection = db.collection('form')

    const joined = await formCollection.where({ clientId }).limit(1).get()
    if (joined.data && joined.data.length) {
      const exist = joined.data[0]
      if (exist.groupId === groupId) {
        return { success: true, data: { groupId } }
      }
      throw new Error('已加入其他小组')
    }

    const groupRes = await groupCollection.where({ groupId }).limit(1).get()
    const group = groupRes.data && groupRes.data[0]
    if (!group) throw new Error('小组不存在')

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

    return { success: true, data: { groupId } }
  } catch (err) {
    console.error('joinGroup error', err)
    return { success: false, errorMessage: err.message || '云函数执行异常' }
  }
}
