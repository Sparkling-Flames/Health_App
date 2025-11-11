// AI 总结占位：调用阿里云大模型时替换此逻辑
module.exports = async (args, db, clientId, ctx) => {
  // args.reportId 可用于读取 report 集合详情
  const { reportId } = args || {}
  if (!reportId) {
    throw Error('缺少 reportId')
  }
  // 读取报告数据，为后续 AI 调用准备上下文
  let reportDoc
  try {
    const res = await db.collection('report').doc(reportId).get()
    reportDoc = res.data
  } catch (e) {
    console.error(e)
  }
  // TODO: 在此调用阿里云百炼/通义千问等模型生成总结
  // 目前返回占位文本，提醒开发者替换
  return {
    text: reportDoc
      ? `报告区间 ${reportDoc.start} ~ ${reportDoc.end}\n总摄入 ${reportDoc.totalDiet} kcal, 总消耗 ${reportDoc.totalSport} kcal。请接入阿里云大模型返回更详细分析。`
      : '未找到报告数据，无法生成 AI 总结。'
  }
}
