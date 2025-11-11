'use strict'

const db = uniCloud.database()

exports.main = async () => {
  try {
    const res = await db
      .collection('group')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get()
    return { success: true, data: { groupList: res.data || [] } }
  } catch (err) {
    console.error('getManyGroup error', err)
    return { success: false, errorMessage: err.message || '云函数执行异常' }
  }
}
