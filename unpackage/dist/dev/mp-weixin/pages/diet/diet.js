"use strict";
const common_vendor = require("../../common/vendor.js");
const services_api = require("../../services/api.js");
const _sfc_main = {
  __name: "diet",
  setup(__props) {
    const food = common_vendor.ref("");
    const calories = common_vendor.ref(0);
    const list = common_vendor.ref([]);
    const total = common_vendor.computed(
      () => list.value.reduce((sum, item) => sum + Number(item.calories || 0), 0)
    );
    const load = async () => {
      const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      try {
        const res = await services_api.dietService.dailyDiet(today);
        list.value = res.records || [];
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/diet/diet.vue:35", e);
      }
    };
    const addDiet = async () => {
      if (!food.value || !calories.value) {
        common_vendor.index.showToast({ title: "请填写完整", icon: "none" });
        return;
      }
      try {
        await services_api.dietService.addDiet({
          food: food.value,
          calories: Number(calories.value),
          date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
        });
        food.value = "";
        calories.value = 0;
        await load();
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/diet/diet.vue:54", e);
      }
    };
    common_vendor.onShow(load);
    return (_ctx, _cache) => {
      return {
        a: common_vendor.t(total.value),
        b: food.value,
        c: common_vendor.o(($event) => food.value = $event.detail.value),
        d: calories.value,
        e: common_vendor.o(common_vendor.m(($event) => calories.value = $event.detail.value, {
          number: true
        })),
        f: common_vendor.o(addDiet),
        g: common_vendor.f(list.value, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.food),
            b: common_vendor.t(item.calories),
            c: item._id
          };
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-97323f43"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/diet/diet.js.map
