<template>
  <view class="container pd20 column">
    <view class="box hero-box">
      <view class="hero-text">
        <view class="title">您好，欢迎回来！</view>
        <view class="subtitle">让我们携手守护您的健康！</view>
      </view>
      <image class="hero-illustration" src="/static/home/hospital.png" mode="widthFix" />
    </view>

    <text class="section-tip-1">今日健康概览</text>

    <view class="box middle-box">
      <swiper class="quick-swiper" circular :indicator-dots="true">
        <swiper-item v-for="(group, gIdx) in cardGroups" :key="gIdx">
          <view class="card-grid">
            <view class="quick-card" v-for="card in group" :key="card.text">
              <image :src="card.icon" mode="aspectFit" />
              <text class="card-value">{{ card.value }}</text>
              <view class="card-label">
                <text class="card-title">{{ card.text }}</text>
                <text class="card-subtitle">{{ card.subText }}</text>
              </view>
            </view>
          </view>
        </swiper-item>
      </swiper>
    </view>

    <text class="section-tip-2">其他功能</text>

    <view class="box action-box">
      <view class="action-grid">
        <view
          class="action-item"
          v-for="item in actionShortcuts"
          :key="item.text"
          @tap="handleActionClick(item)"
        >
          <image :src="item.icon" mode="aspectFit" />
          <text>{{ item.text }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
const db = uniCloud.database();
const dbCmd = db.command;

export default {
  data() {
    return {
      userOpenId: '',
      calorieWatcher: null,
      profileWatcher: null,
      actionShortcuts: [
        { text: '健康报告', icon: '/static/home/report.png', path: '/pages/report/report' },
        { text: 'ai分析', icon: '/static/home/ai.png', path: '/pages/ai_analyse/ai_analyse'},
        { text: '饮食记录', icon: '/static/home/diet_records.png', path: '/pages/diet/diet_records'},
        { text: '运动记录', icon: '/static/home/sport_records.png', path: '/pages/sport/sport_records'},
        { text: '健康提醒', icon: '/static/home/remind.png', path: '/pages/remind/remind' },
        { text: '更多服务', icon: '' }
      ],
      cardGroups: [
        [
          { text: 'calorie', subText: 'mg', value: '0.0', icon: '/static/home/calorie.png' },
          { text: 'height', subText: 'm', value: '--', icon: '/static/home/height.png' },
          { text: 'weight', subText: 'kg', value: '--', icon: '/static/home/weight.png' },
          { text: '', subText: '', value: '', icon: '' }
        ],
        [
          { text: '', subText: '', value: '-', icon: '' },
          { text: '', subText: '', value: '-', icon: '' },
          { text: '', subText: '', value: '-', icon: '' },
          { text: '', subText: '', value: '-', icon: '' }
        ]
      ]
    };
  },
  onLoad() {
    const cachedProfile = uni.getStorageSync('userProfile');
    this.userOpenId = cachedProfile?.openid || '';
    if (!this.userOpenId) return;

    this.fetchTodayCalories();
    this.initCalorieWatcher();

    this.fetchUserProfile();
    this.initProfileWatcher();
  },
  onUnload() {
    this.destroyCalorieWatcher();
    this.destroyProfileWatcher();
  },
  methods: {
    async fetchTodayCalories() {
      try {
        const { result } = await uniCloud.callFunction({
          name: 'calorie',
          data: { openid: this.userOpenId }
        });
        const total = Number(result?.data?.totalCalories || 0);
        this.$set(this.cardGroups[0], 0, { ...this.cardGroups[0][0], value: total.toFixed(1) });
      } catch (err) {
        console.error('[home] calorie fn error', err);
      }
    },
    initCalorieWatcher() {
      const { startISO, endISO } = this.getTodayRange();
      this.destroyCalorieWatcher();
      this.calorieWatcher = db
        .collection('daily_calorie_logs')
        .where(
          dbCmd.and([
            { userOpenId: this.userOpenId },
            { consumedAt: dbCmd.gte(startISO) },
            { consumedAt: dbCmd.lt(endISO) }
          ])
        )
        .watch({
          onChange: this.handleCalorieSnapshot,
          onError: (err) => console.error('[home] calorie watch error', err)
        });
    },
    handleCalorieSnapshot(snapshot) {
      const total = snapshot.docs.reduce((sum, doc) => sum + Number(doc.calories || 0), 0);
      this.$set(this.cardGroups[0], 0, { ...this.cardGroups[0][0], value: total.toFixed(1) });
    },
    destroyCalorieWatcher() {
      if (this.calorieWatcher) {
        this.calorieWatcher.close();
        this.calorieWatcher = null;
      }
    },
    async fetchUserProfile() {
      if (!this.userOpenId) return;
      try {
        const { result } = await uniCloud.callFunction({
          name: 'profile',
          data: { openid: this.userOpenId }
        });
        const profile = result?.data;
        if (profile) this.applyProfile(profile);
      } catch (err) {
        console.error('[home] profile fn error', err);
      }
    },
    initProfileWatcher() {
      if (!this.userOpenId) return;
      this.destroyProfileWatcher();
      this.profileWatcher = db
        .collection('user_profiles')
        .where({ openid: this.userOpenId })
        .watch({
          onChange: (snapshot) => {
            const doc = snapshot.docs[0];
            if (doc) this.applyProfile(doc);
          },
          onError: (err) => console.error('[home] profile watch error', err)
        });
    },
    applyProfile(profile) {
      const height = profile.height ? Number(profile.height).toFixed(2) : '--';
      const weight = profile.weight ? Number(profile.weight).toFixed(1) : '--';

      this.$set(this.cardGroups[0], 1, { ...this.cardGroups[0][1], value: height });
      this.$set(this.cardGroups[0], 2, { ...this.cardGroups[0][2], value: weight });
    },
    destroyProfileWatcher() {
      if (this.profileWatcher) {
        this.profileWatcher.close();
        this.profileWatcher = null;
      }
    },
    getTodayRange() {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      return { startISO: this.formatReadable(start), endISO: this.formatReadable(end) };
    },
    formatReadable(date) {
      const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
        date.getHours()
      )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    },
    handleActionClick(item) {
      if (!item?.path) return;
      uni.navigateTo({ url: item.path });
    }
  }
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  background: #f4f7fb;
}
.hero-box {
  min-height: 200rpx;
  padding: 32rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #0eb584, #16c2a3);
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 12rpx 30rpx rgba(15, 23, 42, 0.08);
}
.hero-text {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}
.hero-illustration {
  width: 180rpx;
  height: 180rpx;
}
.hero-box .title {
  font-size: 40rpx;
  font-weight: 600;
}
.hero-box .subtitle {
  margin-top: 12rpx;
  font-size: 30rpx;
  opacity: 0.9;
}
.section-tip-1,
.section-tip-2 {
  margin: 16rpx 0;
  font-size: 32rpx;
  color: #080a0d;
  font-weight: 600;
}
.middle-box,
.action-box {
  padding: 32rpx;
  border-radius: 24rpx;
  background: #fff;
  box-shadow: 0 12rpx 30rpx rgba(15, 23, 42, 0.08);
}
.middle-box {
  min-height: 480rpx;
}
.action-box {
  min-height: 220rpx;
}
.middle-box .title,
.action-box .title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 16rpx;
  color: #0f172a;
}
.quick-swiper {
  height: 540rpx;
  padding-bottom: 16rpx;
}
.card-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  justify-content: center;
}
.quick-card {
  width: calc(45% - 12rpx);
  padding: 20rpx 16rpx;
  border-radius: 16rpx;
  background: #fff;
  box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5rpx;
}
.quick-card image {
  width: 80rpx;
  height: 80rpx;
  object-fit: contain;
}
.card-value {
  font-size: 30rpx;
  font-weight: 600;
  color: #0eb584;
}
.card-label {
  width: auto;
  text-align: center;
  font-size: 24rpx;
  line-height: 1.2;
  transform: scale(0.9);
}
.card-title,
.card-subtitle {
  display: block;       
  line-height: 1.3;
}
.card-title {
  font-size: 30rpx;
  color: #0f172a;
  font-weight: 600;
}
.card-subtitle {
  font-size: 24rpx;
  color: #64748b;
  margin-top: 4rpx;
}
.primary-btn {
  width: 100%;
  height: 96rpx;
  border-radius: 16rpx;
  background: #0eb584;
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
}

.action-box {
  min-height: auto;
}

.action-grid {
  margin-top: 16rpx;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20rpx;
}

.action-item {
  padding: 24rpx 0;
  border-radius: 16rpx;
  background: #f4f7fb;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  box-shadow: inset 0 0 0 1rpx rgba(99, 102, 241, 0.08);
}

.action-item image {
  width: 72rpx;
  height: 72rpx;
}

.action-item text {
  font-size: 24rpx;
  color: #0f172a;
}
</style>