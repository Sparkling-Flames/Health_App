<template>
  <view class="p-3">
    <view class="card" v-if="!groupId">
      <input v-model="form.nickname" placeholder="昵称" />
      <textarea v-model="form.info" placeholder="简介/目标" />
      <button class="mt-2" @click="create">创建小组</button>
    </view>
    <view class="card" v-else>
      <view>当前小组：{{ groupId }}</view>
      <button class="mt-2" @click="loadMembers">刷新成员</button>
      <view class="mt-2" v-for="u in members" :key="u._id">
        {{ u.nickname }} {{ u.isLeader ? '(组长)' : '' }}
      </view>
    </view>
    <view class="card mt-2">
      <view>加入已有小组</view>
      <input v-model="joinId" placeholder="输入小组ID" />
      <input v-model="joinNickname" placeholder="你的昵称" />
      <button class="mt-2" @click="join">加入</button>
    </view>
    <view class="card mt-2">
      <button @click="list">获取可加入小组列表</button>
      <view
        class="mt-2"
        v-for="g in groups"
        :key="g.groupId"
        @click="quickJoin(g.groupId)"
      >
        #{{ g.groupId }} {{ g.leader }} ({{ g.member || 1 }}人)
      </view>
    </view>
  </view>
</template>
<script setup>
import { reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { groupService } from '../../services/api.js'

const groupId = ref('')
const members = ref([])
const groups = ref([])
const form = reactive({ nickname: '', info: '' })
const joinId = ref('')
const joinNickname = ref('')

const loadMembers = async () => {
  if (!groupId.value) return
  try {
    const res = await groupService.groupMembers(groupId.value)
    members.value = res.userList || []
  } catch (e) {
    console.error(e)
  }
}

const loadMyGroup = async () => {
  try {
    const res = await groupService.getMyGroup()
    groupId.value = res.groupId || ''
    if (groupId.value) {
      await loadMembers()
    }
  } catch (e) {
    console.error(e)
  }
}

const create = async () => {
  if (!form.nickname || !form.info) {
    uni.showToast({ title: '请填写完整', icon: 'none' })
    return
  }
  try {
    const res = await groupService.createGroup({
      nickname: form.nickname,
      info: form.info
    })
    groupId.value = res.groupId
    await loadMembers()
  } catch (e) {
    console.error(e)
  }
}

const join = async () => {
  if (!joinId.value || !joinNickname.value) {
    uni.showToast({ title: '缺少信息', icon: 'none' })
    return
  }
  try {
    const res = await groupService.joinGroup({
      groupId: Number(joinId.value),
      nickname: joinNickname.value,
      info: '',
      gender: '',
      code: '',
      age: 0,
      region: []
    })
    groupId.value = res.groupId
    await loadMembers()
  } catch (e) {
    console.error(e)
  }
}

const list = async () => {
  try {
    const res = await groupService.listGroups()
    groups.value = res.groupList || []
  } catch (e) {
    console.error(e)
  }
}

const quickJoin = (id) => {
  joinId.value = String(id)
}

onShow(loadMyGroup)
</script>
<style scoped>
input,textarea{border:1px solid #eee;padding:12rpx;border-radius:8rpx;margin-top:12rpx;width:100%}
button{background:#1afa29;color:#fff;padding:16rpx;border-radius:8rpx;}
</style>
