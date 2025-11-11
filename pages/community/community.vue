<template>
  <view class="p-3">
    <view class="card">
      <input v-model="content" placeholder="发布你的健康留言" />
      <button class="mt-2" @click="publish">发布</button>
    </view>
    <view class="mt-2 card" v-for="m in messages" :key="m._id">
      <view>{{ m.content }}</view>
    </view>
  </view>
</template>
<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { messageService } from '../../services/api.js'

const content = ref('')
const messages = ref([])

const load = async () => {
  try {
    const res = await messageService.listPublic()
    messages.value = res.messages || res.data || []
  } catch (e) {
    console.error(e)
  }
}

const publish = async () => {
  if (!content.value) {
    uni.showToast({ title: '请输入内容', icon: 'none' })
    return
  }
  try {
    await messageService.publish(content.value)
    content.value = ''
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
