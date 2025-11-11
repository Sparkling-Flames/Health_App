<template>
  <view class="p-3">
    <view class="card">
      <text>今日摄入热量：{{ total }} kcal</text>
    </view>
    <view class="mt-2 card">
      <input v-model="food" placeholder="食物名称" />
      <input v-model.number="calories" type="number" placeholder="热量(kcal)" />
      <button class="mt-2" @click="addDiet">添加</button>
    </view>
    <view class="mt-2 card" v-for="item in list" :key="item._id">
      <view>{{ item.food }} - {{ item.calories }} kcal</view>
    </view>
  </view>
</template>
<script setup>
import { ref, computed } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { dietService } from '../../services/api.js'

const food = ref('')
const calories = ref(0)
const list = ref([])

const total = computed(() =>
  list.value.reduce((sum, item) => sum + Number(item.calories || 0), 0)
)

const load = async () => {
  const today = new Date().toISOString().slice(0, 10)
  try {
    const res = await dietService.dailyDiet(today)
    list.value = res.records || []
  } catch (e) {
    console.error(e)
  }
}

const addDiet = async () => {
  if (!food.value || !calories.value) {
    uni.showToast({ title: '请填写完整', icon: 'none' })
    return
  }
  try {
    await dietService.addDiet({
      food: food.value,
      calories: Number(calories.value),
      date: new Date().toISOString().slice(0, 10)
    })
    food.value = ''
    calories.value = 0
    await load()
  } catch (e) {
    console.error(e)
  }
}

onShow(load)
</script>
<style scoped>
input{border:1px solid #eee;padding:12rpx;border-radius:8rpx;margin-top:12rpx}
button{background:#1afa29;color:#fff;padding:16rpx;border-radius:8rpx;}
</style>
