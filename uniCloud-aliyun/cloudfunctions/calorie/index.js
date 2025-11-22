'use strict';

const db = uniCloud.database();
const dbCmd = db.command;
const $ = db.command.aggregate;

const formatReadable = (date) => {
  const pad = (n) => (n < 10 ? `0${n}` : `${n}`);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const getTodayRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { startISO: formatReadable(start), endISO: formatReadable(end) };
};

exports.main = async (event = {}) => {
  const { openid } = event;
  if (!openid) return { code: 400, message: 'missing openid' };

  const { startISO, endISO } = getTodayRange();

  const aggRes = await db
    .collection('daily_calorie_logs')
    .aggregate()
    .match({
      userOpenId: openid,
      consumedAt: dbCmd.and([dbCmd.gte(startISO), dbCmd.lt(endISO)])
    })
    .group({
      _id: '$userOpenId',
      totalCalories: $.sum('$calories')
    })
    .end();

  const total = aggRes.data?.[0]?.totalCalories || 0;
  return {
    code: 0,
    data: { totalCalories: Number(total) }
  };
};