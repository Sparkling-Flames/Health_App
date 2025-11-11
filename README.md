 HEAD
                              # health-uniapp

基于 uni-app (Vue3) 的健康监控示例，包含：
- 用户界面（首页概览）
- 饮食上传/查询
- 运动上传/查询
- 社区留言（消息流）
- 小组/组队（创建、加入、成员列表）
- 报告总结（统计 + 预留 AI 总结）

## 目录结构
- pages/* 页面（home/diet/sport/community/group/report）
- services/api.js 前端服务封装（统一调用云函数/HTTP）
- uniCloud-aliyun/cloudfunctions 云函数聚合与模块

## 云函数 API
- message(action,publish|list)
- createGroup/joinGroup/getManyGroup/getManyForm/getMyGroup
- diet（添加/按日查询）
- sport（添加/按日查询）
- report（生成/查询）

## 数据集合建议
- messages: { content, public, createdAt, clientId }
- group: { leader, info, member, groupId, createdAt, clientId }
- form: { nickname, isLeader, info, groupId, clientId }
- diet: { food, calories, date, clientId, createdAt }
- sport: { sport, calories, date, clientId, createdAt }
- report: { start, end, totalDiet, totalSport, clientId, createdAt }

## AI 总结（阿里云 Serverless）
- 在 report 生成后调用 aiSummary(reportId)：
  - 你可以在 fun/functions/aiSummary.js 中接入阿里云百炼/通义千问的函数调用，返回文字分析。
  - 前端通过 reportService.aiSummary 获取结果并展示。


=======
# Health_App
>>>>>>> 089dbef4974efdc9709fe1e3cf09202ba06305dc
