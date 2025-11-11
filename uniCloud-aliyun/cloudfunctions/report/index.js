'use strict'

const db = uniCloud.database()

function toUtcDate(str) {
  const date = new Date(`${str}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) throw new Error('日期格式不正确')
  return date
}

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
    const { start, end } = args
    if (!clientId) throw new Error('未获取到客户端标识')
    if (!start || !end) throw new Error('缺少日期范围')

    const startDate = toUtcDate(String(start))
    const endDate = toUtcDate(String(end))
    if (startDate.getTime() > endDate.getTime()) throw new Error('开始日期不能晚于结束日期')

    let totalDiet = 0
    let totalSport = 0
    const dietCollection = db.collection('diet')
    const sportCollection = db.collection('sport')
    const cursor = new Date(startDate)

    while (cursor.getTime() <= endDate.getTime()) {
      const dateStr = cursor.toISOString().slice(0, 10)
      const [dietRes, sportRes] = await Promise.all([
        dietCollection.where({ clientId, date: dateStr }).get(),
        sportCollection.where({ clientId, date: dateStr }).get()
      ])
      totalDiet += (dietRes.data || []).reduce((sum, item) => sum + Number(item.calories || 0), 0)
      totalSport += (sportRes.data || []).reduce((sum, item) => sum + Number(item.calories || 0), 0)
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }

    const now = Date.now()
    const reportDoc = {
      start: String(start),
      end: String(end),
      totalDiet,
      totalSport,
      clientId,
      createdAt: now
    }
    const res = await db.collection('report').add(reportDoc)

    return { success: true, data: { reportId: res.id, totalDiet, totalSport } }
  } catch (err) {
    console.error('report error', err)
    return { success: false, errorMessage: err.message || '云函数执行异常' }
  }
}
