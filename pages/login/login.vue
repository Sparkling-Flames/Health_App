<template>
  <view class="login-page">
    <view class="hero-img">
      <image src="/image/login/1.png" mode="aspectFit" />
      <view class="hero-text">
        <text class="hero-title">健康管理</text>
        <text class="hero-subtitle">守护您的健康每一天</text>
      </view>
    </view>
    <view class="action-card">
      <image class="card-illustration" src="/image/login/2.png" mode="widthFix" />
      <button class="login-btn" :loading="loading" @tap="openLoginMenu">
        微信快捷登录
      </button>
    </view>
  </view>
</template>

<script>
import { loginByOpenId } from '@/services/api.js';

export default {
  data() {
    return {
      loading: false,
      profileCache: null,
      form: {
        height: '',
        weight: '',
        comment: '',
        post: '',
        sportRecord: {
          sportType: '',
          distance: null,
          duration: null
        }
      }
    };
  },
  methods: {
    openLoginMenu() {
      if (this.loading) return;
      uni.showActionSheet({
        itemList: ['微信头像授权登录'],
        success: () => this.doWechatLogin()
      });
    },
    async doWechatLogin() {
      if (this.loading) return;
      this.loading = true;
      try {
        let userProfile = {};
        try {
          const profileRes = await uni.getUserProfile({ desc: '用于完善个人资料' });
          userProfile = profileRes.userInfo || {};
        } catch (err) {
          console.warn('用户未授权头像昵称', err);
        }

        const loginRes = await uni.login({ provider: 'weixin' });
        if (!loginRes?.code) throw new Error('无法获取登录凭证');

        const { result } = await loginByOpenId({
          code: loginRes.code,
          profile: {
            ...userProfile,
            height: this.form.height ? Number(this.form.height) : null,
            weight: this.form.weight ? Number(this.form.weight) : null,
            comment: this.form.comment,
            post: this.form.post,
            sportRecord: this.normalizeSportRecordPayload()
          }
        });

        if (result.code !== 0) throw new Error(result.message || '登录失败');

        const userData = result.data.user;
        this.profileCache = userData;              // 组件内保存
        uni.setStorageSync('userProfile', userData); // 本地缓存
        uni.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => {
          uni.reLaunch({ url: '/pages/home/home' });
        }, 300);
      } catch (error) {
        uni.showToast({ title: error.message || '登录失败', icon: 'none' });
      } finally {
        this.loading = false;
      }
    },
    normalizeSportRecordPayload() {
      const { sportType, distance, duration } = this.form.sportRecord;
      if (!sportType || distance == null || duration == null) return null;
      return {
        sportType,
        distance: Number(distance),
        duration: Number(duration)
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.login-page {
  min-height: 8%;
  position: relative;
  background: #e6f7f0;
  padding-top: 33vh;
}

.hero-img {
  position: absolute;
  top: 10vh;
  left: 53%;
  transform: translateX(-50%);
  width: 100%;
  display: flex;
  justify-content: center;
  flex-direction: column; 
  align-items: center;
}

.hero-text {
  display: block;
  width: 100%;
  margin-top: 20rpx;
  color: #1f2f50;
}

.hero-text .hero-title,
.hero-text .hero-subtitle {
  display: block; // 强制各自单独一行
}

.hero-title {
  font-size: 40rpx;
  display: block;
  margin-left: 37%;
  text-align: left;
  font-weight: 600;
}

.card-illustration {
  display: block;
  width: 30%;
  margin: 0 auto 24rpx;
  border-radius: 16rpx;
}

.hero-subtitle {
  margin-top: 8rpx;
  font-size: 26rpx;
  margin-left: 32%;
  text-align: left;
  color: #6e7a9b;
}

.hero-img image {
  width: 200rpx;
  height: 200rpx;
}

.action-card {
  margin: 80rpx auto 0;
  padding: 40rpx 32rpx;
  border-radius: 24rpx;
  width: 570rpx; 
  height: 550rpx;
  background: #fff;
  box-shadow: 0 12rpx 30rpx rgba(0, 0, 0, 0.25); // 黑色阴影
}

.login-btn {
  width: 100%;
  height: 96rpx;
  border-radius: 8rpx; // 方形
  background-color: #0eb584; // 纯绿色填充
  color: #fff;
  font-size: 32rpx;
  font-weight: 600;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero {
  text-align: center;
  margin-bottom: 40rpx;
  .title {
    font-size: 48rpx;
    font-weight: 600;
    color: #1f2f50;
  }
}

.subtitle {
    display: block;
    margin-top: 12rpx;
    font-size: 26rpx;
    color: #6e7a9b;
}

</style>