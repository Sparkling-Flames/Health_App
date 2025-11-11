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
  const clientId = resolveClientId(event, context)
  try {
    if (!clientId) return { success: true, data: { groupId: '' } }
    const res = await db.collection('form').where({ clientId }).limit(1).get()
    const form = res.data && res.data[0]
    if (!form) return { success: true, data: { groupId: '' } }
    return { success: true, data: { groupId: form.groupId, isLeader: !!form.isLeader } }
  } catch (err) {
    console.error('getMyGroup error', err)
    return { success: false, errorMessage: err.message || '云函数执行异常' }
  }
}
