'use strict'

module.exports = async (_args, db) => {
  const res = await db
    .collection('group')
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get()
  return { groupList: res.data || [] }
}
