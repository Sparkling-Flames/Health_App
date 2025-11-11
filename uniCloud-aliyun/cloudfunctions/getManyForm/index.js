'use strict'

const db = uniCloud.database()

exports.main = async (event) => {
  try {
    const args = event || {}
    const groupId = Number(args.groupId)
    if (!groupId) throw new Error('缺少 groupId')
    const res = await db.collection('form').where({ groupId }).limit(200).get()
    const list = (res.data || []).sort((a, b) => {
      if (!!b.isLeader !== !!a.isLeader) return b.isLeader ? 1 : -1
      return (a.createdAt || 0) - (b.createdAt || 0)
    })
    return { success: true, data: { userList: list } }
  } catch (err) {
    console.error('getManyForm error', err)
    return { success: false, errorMessage: err.message || '云函数执行异常' }
  }
}
