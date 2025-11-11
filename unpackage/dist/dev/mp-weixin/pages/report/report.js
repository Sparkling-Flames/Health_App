"use strict";
const common_vendor = require("../../common/vendor.js");
const services_api = require("../../services/api.js");
const _sfc_main = {
  __name: "report",
  setup(__props) {
    const start = common_vendor.ref("");
    const end = common_vendor.ref("");
    const report = common_vendor.ref(null);
    const aiText = common_vendor.ref("");
    const onStart = (e) => {
      start.value = e.detail.value;
    };
    const onEnd = (e) => {
      end.value = e.detail.value;
    };
    const generate = async () => {
      if (!start.value || !end.value) {
        common_vendor.index.showToast({ title: "选择日期", icon: "none" });
        return;
      }
      const days = [];
      const endDate = new Date(end.value);
      const cursor = new Date(start.value);
      while (cursor <= endDate) {
        days.push(cursor.toISOString().slice(0, 10));
        cursor.setDate(cursor.getDate() + 1);
      }
      let dietTotal = 0;
      let sportTotal = 0;
      for (const d of days) {
        try {
          const diet = await services_api.dietService.dailyDiet(d);
          dietTotal += (diet.records || []).reduce((s, i) => s + i.calories, 0);
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/report/report.vue:61", e);
        }
        try {
          const sport = await services_api.sportService.dailySport(d);
          sportTotal += (sport.records || []).reduce((s, i) => s + i.calories, 0);
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/report/report.vue:67", e);
        }
      }
      report.value = { totalDiet: dietTotal, totalSport: sportTotal };
      aiText.value = "";
    };
    const ai = async () => {
      if (!report.value)
        return;
      try {
        const generated = await services_api.reportService.generate({
          start: start.value,
          end: end.value
        });
        const aiRes = await services_api.reportService.aiSummary(generated.reportId);
        aiText.value = aiRes.text || "暂无AI返回";
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/report/report.vue:84", e);
      }
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(start.value),
        b: common_vendor.o(onStart),
        c: start.value,
        d: common_vendor.t(end.value),
        e: common_vendor.o(onEnd),
        f: end.value,
        g: common_vendor.o(generate),
        h: report.value
      }, report.value ? {
        i: common_vendor.t(report.value.totalDiet),
        j: common_vendor.t(report.value.totalSport),
        k: common_vendor.o(ai)
      } : {}, {
        l: aiText.value
      }, aiText.value ? {
        m: common_vendor.t(aiText.value)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-12a8021c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/report/report.js.map
