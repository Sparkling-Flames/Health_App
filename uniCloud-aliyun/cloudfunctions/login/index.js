'use strict';

const WX_APPID = 'wxa29ed0a9b3dffa07';
const WX_SECRET = '0b4a9f3454e5c9ab446ab681cf5d2501';

const db = uniCloud.database();

const normalizeSportRecord = (record, timestamp) => {
  if (
    !record ||
    typeof record !== 'object' ||
    !record.sportType ||
    typeof record.distance !== 'number' ||
    typeof record.duration !== 'number'
  ) {
    return null;
  }
  return {
    sportType: record.sportType,
    distance: record.distance,
    duration: record.duration,
    recordedAt: record.recordedAt || timestamp
  };
};

const formatCNTime = (date) =>
  date.toLocaleString('zh-CN', { hour12: false, timeZone: 'Asia/Shanghai' });


exports.main = async (event = {}) => {
  const { code, profile = {} } = event;
  const loginDate = new Date();
  const nowISO = formatCNTime(loginDate);  // 改用本地可读格式
  const nowTs = loginDate.getTime();
  const sportRecord = normalizeSportRecord(profile.sportRecord, nowTs);

  if (!code) return { code: 400, message: '缺少登录凭证' };
  if (!WX_APPID || !WX_SECRET) return { code: 500, message: '未配置微信小程序 AppID/Secret' };


  const authUrl =
    `https://api.weixin.qq.com/sns/jscode2session?appid=${WX_APPID}` +
    `&secret=${WX_SECRET}&js_code=${code}&grant_type=authorization_code`;

  const authRes = await uniCloud.httpclient.request(authUrl, {
    method: 'GET',
    dataType: 'json',
    timeout: 5000
  });

  if (authRes.status !== 200 || authRes.data.errcode) {
    return {
      code: authRes.data.errcode || 500,
      message: authRes.data.errmsg || 'openid 获取失败'
    };
  }

  const openid = authRes.data.openid;
  const userCollection = db.collection('user_profiles');
  const userRes = await userCollection.where({ openid }).limit(1).get();


  const sanitizedProfile = {
    nickname: profile.nickName || '',
    avatar: profile.avatarUrl || '',
    height: typeof profile.height === 'number' ? profile.height : null,
    weight: typeof profile.weight === 'number' ? profile.weight : null,
    calorieTarget: typeof profile.calorieTarget === 'number' ? profile.calorieTarget : null
  };

  let userDoc;

  if (!userRes.data.length) {
    userDoc = {
      openid,
      nickname: sanitizedProfile.nickname,
      avatar: sanitizedProfile.avatar,
      height: sanitizedProfile.height,
      weight: sanitizedProfile.weight,
      calorieTarget: sanitizedProfile.calorieTarget,
      createdAt: nowISO,
      updatedAt: nowISO
    };
    const addRes = await userCollection.add(userDoc);
    userDoc._id = addRes.id || addRes.insertedId;
  } else {
    userDoc = userRes.data[0];
    const updatePayload = { updatedAt: nowISO };
    let needUpdate = false;

    if (!userDoc.nickname && sanitizedProfile.nickname) {
      updatePayload.nickname = sanitizedProfile.nickname;
      needUpdate = true;
    }
    if (!userDoc.avatar && sanitizedProfile.avatar) {
      updatePayload.avatar = sanitizedProfile.avatar;
      needUpdate = true;
    }
    if (sanitizedProfile.height !== null && sanitizedProfile.height !== userDoc.height) {
      updatePayload.height = sanitizedProfile.height;
      needUpdate = true;
    }
    if (sanitizedProfile.weight !== null && sanitizedProfile.weight !== userDoc.weight) {
      updatePayload.weight = sanitizedProfile.weight;
      needUpdate = true;
    }
    if (sanitizedProfile.calorieTarget !== null && sanitizedProfile.calorieTarget !== userDoc.calorieTarget) {
      updatePayload.calorieTarget = sanitizedProfile.calorieTarget;
      needUpdate = true;
    }

    if (needUpdate) {
      await userCollection.doc(userDoc._id).update(updatePayload);
      userDoc = { ...userDoc, ...updatePayload };
    }
  }

  if (sportRecord) {
    const sportCollection = db.collection('sport_records');
    await sportCollection.add({ userOpenId: openid, ...sportRecord });
  }
  if (profile.post) {
    const postsCollection = db.collection('posts');
    await postsCollection.add({
      userOpenId: openid,
      content: profile.post,
      media: profile.media || [],
      likeCount: 0,
      createdAt: now,
      updatedAt: now
    });
  }
  if (profile.comment && profile.postId) {
    const commentCollection = db.collection('post_comments');
    await commentCollection.add({
      postId: profile.postId,
      userOpenId: openid,
      content: profile.comment,
      createdAt: now
    });
  }

  return {
    code: 0,
    message: '登录成功',
    data: { openid, user: userDoc }
  };
};