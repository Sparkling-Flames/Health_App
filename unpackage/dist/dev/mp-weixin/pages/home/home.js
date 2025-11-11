"use strict";
const common_vendor = require("../../common/vendor.js");
const services_api = require("../../services/api.js");
const _sfc_main = {
  __name: "home",
  setup(__props) {
    const summary = common_vendor.reactive({ diet: 0, sport: 0 });
    const groupId = common_vendor.ref("");
    const loadData = async () => {
      const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      try {
        const [diet, sport, g] = await Promise.all([
          services_api.dietService.dailyDiet(today),
          services_api.sportService.dailySport(today),
          services_api.groupService.getMyGroup()
        ]);
        summary.diet = (diet.records || []).reduce((s, i) => s + i.calories, 0);
        summary.sport = (sport.records || []).reduce((s, i) => s + i.calories, 0);
        groupId.value = g.groupId || "";
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/home/home.vue:37", e);
      }
    };
    common_vendor.onShow(loadData);
    const toDiet = () => common_vendor.index.navigateTo({ url: "/pages/diet/diet" });
    const toSport = () => common_vendor.index.navigateTo({ url: "/pages/sport/sport" });
    const toCommunity = () => common_vendor.index.navigateTo({ url: "/pages/community/community" });
    const toGroup = () => common_vendor.index.navigateTo({ url: "/pages/group/group" });
    const toReport = () => common_vendor.index.navigateTo({ url: "/pages/report/report" });
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(summary.diet),
        b: common_vendor.t(summary.sport),
        c: common_vendor.t(groupId.value || "未加入"),
        d: common_vendor.o(toDiet),
        e: common_vendor.o(toSport),
        f: common_vendor.o(toCommunity),
        g: common_vendor.o(toGroup),
        h: common_vendor.o(toReport)
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-07e72d3c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/home/home.js.map
