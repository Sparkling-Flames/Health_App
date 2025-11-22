'use strict';

const db = uniCloud.database();

exports.main = async (event = {}) => {
  const { openid } = event;
  if (!openid) return { code: 400, message: 'missing openid' };

  const res = await db.collection('user_profiles').where({ openid }).limit(1).get();
  const doc = res.data?.[0];
  if (!doc) return { code: 404, message: 'user not found' };

  return {
    code: 0,
    data: {
      height: doc.height ?? null,
      weight: doc.weight ?? null,
      updatedAt: doc.updatedAt ?? ''
    }
  };
};