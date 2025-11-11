"use strict";
const common_vendor = require("../../common/vendor.js");
const services_api = require("../../services/api.js");
const _sfc_main = {
  __name: "community",
  setup(__props) {
    const content = common_vendor.ref("");
    const messages = common_vendor.ref([]);
    const load = async () => {
      try {
        const res = await services_api.messageService.listPublic();
        messages.value = res.messages || res.data || [];
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/community/community.vue:25", e);
      }
    };
    const publish = async () => {
      if (!content.value) {
        common_vendor.index.showToast({ title: "请输入内容", icon: "none" });
        return;
      }
      try {
        await services_api.messageService.publish(content.value);
        content.value = "";
        await load();
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/community/community.vue:39", e);
      }
    };
    common_vendor.onShow(load);
    return (_ctx, _cache) => {
      return {
        a: content.value,
        b: common_vendor.o(($event) => content.value = $event.detail.value),
        c: common_vendor.o(publish),
        d: common_vendor.f(messages.value, (m, k0, i0) => {
          return {
            a: common_vendor.t(m.content),
            b: m._id
          };
        })
      };
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-a6ef5318"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/community/community.js.map
