// 基础云函数/HTTP调用封装
// 可在 HBuilderX 中替换为 uniCloud.callFunction 或 uni.request
export function callApi({ api, data = {}, loading = false }) {
  // 占位：统一错误处理/Loading
  if (loading) uni.showLoading({ title: '加载中' })
  return new Promise((resolve, reject) => {
    uniCloud.callFunction({
      name: 'fun',
      data: { api, args: data }
    }).then(res => {
      if (loading) uni.hideLoading()
      if (res.result && res.result.success) {
        resolve(res.result.data)
      } else {
        uni.showToast({ title: res.result?.errorMessage || '错误', icon: 'none' })
        reject(res.result?.errorMessage)
      }
    }).catch(err => {
      if (loading) uni.hideLoading()
      uni.showToast({ title: '网络错误', icon: 'none' })
      reject(err)
    })
  })
}

export const groupService = {
  getMyGroup() { return callApi({ api: 'getMyGroup' }) },
  listGroups() { return callApi({ api: 'getManyGroup', loading: true }) },
  createGroup(form) { return callApi({ api: 'createGroup', data: form, loading: true }) },
  joinGroup(form) { return callApi({ api: 'joinGroup', data: form, loading: true }) },
  groupMembers(groupId) { return callApi({ api: 'getManyForm', data: { groupId }, loading: true }) }
}

export const messageService = {
  listPublic() {
    return callApi({ api: 'message', data: { action: 'list' }, loading: true })
  },
  publish(content) {
    return callApi({
      api: 'message',
      data: { action: 'publish', content },
      loading: true
    })
  }
}

export const dietService = {
  addDiet(record) {
    return callApi({ api: 'diet', data: record })
  },
  dailyDiet(date) {
    return callApi({ api: 'diet', data: { date }, loading: true })
  }
}

export const sportService = {
  addSport(record) {
    return callApi({ api: 'sport', data: record })
  },
  dailySport(date) {
    return callApi({ api: 'sport', data: { date }, loading: true })
  }
}

export const reportService = {
  generate(dateRange) {
    return callApi({ api: 'report', data: dateRange, loading: true })
  },
  aiSummary(reportId) {
    return callApi({ api: 'aiSummary', data: { reportId }, loading: true })
  }
}
