<template>
  <view class="p-3">
    <view class="card">
      <view>报告生成</view>
      <picker mode="date" @change="onStart" :value="start">
        <view class="mt-2">开始日期：{{ start }}</view>
      </picker>
      <picker mode="date" @change="onEnd" :value="end">
        <view class="mt-2">结束日期：{{ end }}</view>
      </picker>
      <button class="mt-2" @click="generate">生成基础报告</button>
    </view>
    <view v-if="report" class="card mt-2">
      <view>基础统计：</view>
      <view>总摄入：{{ report.totalDiet }} kcal</view>
      <view>总消耗：{{ report.totalSport }} kcal</view>
      <button class="mt-2" @click="ai">AI 总结</button>
    </view>
    <view v-if="aiText" class="card mt-2">
      <view>AI 分析：</view>
      <text>{{ aiText }}</text>
    </view>
  </view>
</template>
<script setup>
import { ref } from 'vue'
import { reportService, dietService, sportService } from '../../services/api.js'

const start = ref('')
const end = ref('')
const report = ref(null)
const aiText = ref('')

const onStart = (e) => {
  start.value = e.detail.value
}

const onEnd = (e) => {
  end.value = e.detail.value
}

const generate = async () => {
  if (!start.value || !end.value) {
    uni.showToast({ title: '选择日期', icon: 'none' })
    return
  }
  const days = []
  const endDate = new Date(end.value)
  const cursor = new Date(start.value)
  while (cursor <= endDate) {
    days.push(cursor.toISOString().slice(0, 10))
    cursor.setDate(cursor.getDate() + 1)
  }
  let dietTotal = 0
  let sportTotal = 0
  for (const d of days) {
    try {
      const diet = await dietService.dailyDiet(d)
      dietTotal += (diet.records || []).reduce((s, i) => s + i.calories, 0)
    } catch (e) {
      console.error(e)
    }
    try {
      const sport = await sportService.dailySport(d)
      sportTotal += (sport.records || []).reduce((s, i) => s + i.calories, 0)
    } catch (e) {
      console.error(e)
    }
  }
  report.value = { totalDiet: dietTotal, totalSport: sportTotal }
  aiText.value = ''
}

const ai = async () => {
  if (!report.value) return
  try {
    const generated = await reportService.generate({
      start: start.value,
      end: end.value
    })
    const aiRes = await reportService.aiSummary(generated.reportId)
    aiText.value = aiRes.text || '暂无AI返回'
  } catch (e) {
    console.error(e)
  }
}
</script>
<style scoped>
button{background:#1afa29;color:#fff;padding:16rpx;border-radius:8rpx;}
</style>
