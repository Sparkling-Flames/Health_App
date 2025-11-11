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
- uniCloud-aliyun/cloudfunctions/fun 云函数聚合与模块

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

## 迁移到 HBuilderX
- 复制 apps/health-uniapp 整个目录到 HBuilderX 并作为项目打开
- 打开 manifest 面板：
  - 绑定 DCloud AppID（用于关联 uniCloud）。当前文件中的顶层 `appid` 为占位，绑定后会自动替换
  - 微信小程序 AppID：已写入 `mp-weixin.appid = wxd69d0e6aea4600da`（如需更换在 manifest 面板修改）
  - 确认使用 Vue 版本为 3
- 关联/创建 uniCloud（阿里云）服务空间：HBuilderX 左侧 uniCloud 面板 → 关联服务空间
- 右键上传部署云函数：`uniCloud-aliyun/cloudfunctions/fun`
- 初始化数据库集合：在 `uniCloud-aliyun/database/init.json` 可作为结构参考，实际在控制台或 HBuilderX 数据库面板创建
- 运行到微信开发者工具/H5 进行联调验证
