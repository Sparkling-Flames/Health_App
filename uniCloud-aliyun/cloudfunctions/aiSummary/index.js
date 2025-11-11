'use strict'

const db = uniCloud.database()

exports.main = async (event) => {
  try {
    const { reportId } = event || {}
    if (!reportId) throw new Error('缺少 reportId')
    let reportDoc
    try {
      const res = await db.collection('report').doc(reportId).get()
      reportDoc = res.data
    } catch (e) {
      console.error(e)
    }
    return {
      success: true,
      data: {
        text: reportDoc
          ? `报告区间 ${reportDoc.start} ~ ${reportDoc.end}\n总摄入 ${reportDoc.totalDiet} kcal, 总消耗 ${reportDoc.totalSport} kcal。请接入阿里云大模型返回更详细分析。`
          : '未找到报告数据，无法生成 AI 总结。'
      }
    }
  } catch (err) {
    console.error('aiSummary error', err)
    return { success: false, errorMessage: err.message || '云函数执行异常' }
  }
}
