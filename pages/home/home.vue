<template>
  <view class="p-3">
    <view class="card">
      <text>欢迎来到健康监控</text>
      <view class="mt-2 text-muted">今日概览</view>
      <view class="mt-2">摄入热量：{{ summary.diet }} kcal</view>
      <view>消耗热量：{{ summary.sport }} kcal</view>
  <view class="mt-2">小组：{{ groupId || '未加入' }}</view>
    </view>
    <button class="mt-2" @click="toDiet">饮食记录</button>
    <button class="mt-2" @click="toSport">运动记录</button>
    <button class="mt-2" @click="toCommunity">社区</button>
    <button class="mt-2" @click="toGroup">小组</button>
    <button class="mt-2" @click="toReport">报告总结</button>
  </view>
</template>
<script setup>
import { reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { groupService, dietService, sportService } from '../../services/api.js'

const summary = reactive({ diet: 0, sport: 0 })
const groupId = ref('')

const loadData = async () => {
  const today = new Date().toISOString().slice(0, 10)
  try {
    const [diet, sport, g] = await Promise.all([
      dietService.dailyDiet(today),
      sportService.dailySport(today),
      groupService.getMyGroup()
    ])
    summary.diet = (diet.records || []).reduce((s, i) => s + i.calories, 0)
    summary.sport = (sport.records || []).reduce((s, i) => s + i.calories, 0)
    groupId.value = g.groupId || ''
  } catch (e) {
    console.error(e)
  }
}

onShow(loadData)

const toDiet = () => uni.navigateTo({ url: '/pages/diet/diet' })
const toSport = () => uni.navigateTo({ url: '/pages/sport/sport' })
const toCommunity = () => uni.navigateTo({ url: '/pages/community/community' })
const toGroup = () => uni.navigateTo({ url: '/pages/group/group' })
const toReport = () => uni.navigateTo({ url: '/pages/report/report' })
</script>
<style scoped>
button{background:#1afa29;color:#fff;padding:16rpx;border-radius:8rpx;}
</style>
