"use strict";
const common_vendor = require("../common/vendor.js");
function callApi({ api, data = {}, loading = false }) {
  if (loading)
    common_vendor.index.showLoading({ title: "加载中" });
  return new Promise((resolve, reject) => {
    common_vendor.tr.callFunction({
      name: "fun",
      data: { api, args: data }
    }).then((res) => {
      var _a, _b;
      if (loading)
        common_vendor.index.hideLoading();
      if (res.result && res.result.success) {
        resolve(res.result.data);
      } else {
        common_vendor.index.showToast({ title: ((_a = res.result) == null ? void 0 : _a.errorMessage) || "错误", icon: "none" });
        reject((_b = res.result) == null ? void 0 : _b.errorMessage);
      }
    }).catch((err) => {
      if (loading)
        common_vendor.index.hideLoading();
      common_vendor.index.showToast({ title: "网络错误", icon: "none" });
      reject(err);
    });
  });
}
const groupService = {
  getMyGroup() {
    return callApi({ api: "getMyGroup" });
  },
  listGroups() {
    return callApi({ api: "getManyGroup", loading: true });
  },
  createGroup(form) {
    return callApi({ api: "createGroup", data: form, loading: true });
  },
  joinGroup(form) {
    return callApi({ api: "joinGroup", data: form, loading: true });
  },
  groupMembers(groupId) {
    return callApi({ api: "getManyForm", data: { groupId }, loading: true });
  }
};
const messageService = {
  listPublic() {
    return callApi({ api: "message", data: { action: "list" }, loading: true });
  },
  publish(content) {
    return callApi({
      api: "message",
      data: { action: "publish", content },
      loading: true
    });
  }
};
const dietService = {
  addDiet(record) {
    return callApi({ api: "diet", data: record });
  },
  dailyDiet(date) {
    return callApi({ api: "diet", data: { date }, loading: true });
  }
};
const sportService = {
  addSport(record) {
    return callApi({ api: "sport", data: record });
  },
  dailySport(date) {
    return callApi({ api: "sport", data: { date }, loading: true });
  }
};
const reportService = {
  generate(dateRange) {
    return callApi({ api: "report", data: dateRange, loading: true });
  },
  aiSummary(reportId) {
    return callApi({ api: "aiSummary", data: { reportId }, loading: true });
  }
};
exports.dietService = dietService;
exports.groupService = groupService;
exports.messageService = messageService;
exports.reportService = reportService;
exports.sportService = sportService;
//# sourceMappingURL=../../.sourcemap/mp-weixin/services/api.js.map
