'use strict'

module.exports = async (_args, db, clientId) => {
  if (!clientId) {
    return { groupId: '' }
  }
  const res = await db.collection('form').where({ clientId }).limit(1).get()
  const form = res.data && res.data[0]
  if (!form) {
    return { groupId: '' }
  }
  return {
    groupId: form.groupId,
    isLeader: !!form.isLeader
  }
}
