<template>
  <view class="pd20 column gap">
    <view class="card colorCard">
      <view class="fs36">今日摄入热量</view>
      <view class="fs60 fwb">{{ total }} kcal</view>
    </view>
    <view class="card">
      <view class="fs32 fwb">记录今日饮食</view>
      <input class="input" v-model="food" placeholder="食物名称" />
      <input
        class="input"
        v-model.number="calories"
        type="number"
        placeholder="热量(kcal)"
      />
      <button class="mgt20" @click="addDiet">添加记录</button>
    </view>
    <view class="card" v-for="item in list" :key="item._id">
      <view class="fs32 fwb">{{ item.food }}</view>
      <view class="mgt10 c6">{{ item.calories }} kcal</view>
      <view class="c9 fs24">{{ item.date }}</view>
    </view>
  </view>
</template>
<script setup>
import { ref, computed } from "vue";
import { onShow } from "@dcloudio/uni-app";
import { dietService } from "../../services/api.js";

const food = ref("");
const calories = ref(0);
const list = ref([]);

const total = computed(() =>
  list.value.reduce((sum, item) => sum + Number(item.calories || 0), 0)
);

const load = async () => {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const res = await dietService.dailyDiet(today);
    list.value = res.records || [];
  } catch (e) {
    console.error(e);
  }
};

const addDiet = async () => {
  if (!food.value || !calories.value) {
    uni.showToast({ title: "请填写完整", icon: "none" });
    return;
  }
  try {
    await dietService.addDiet({
      food: food.value,
      calories: Number(calories.value),
      date: new Date().toISOString().slice(0, 10),
    });
    food.value = "";
    calories.value = 0;
    await load();
  } catch (e) {
    console.error(e);
  }
};

onShow(load);
</script>
<style scoped>
.column.gap > .card + .card {
  margin-top: 20rpx;
}
</style>
