import request from '@/utils/request'

export function apiLogin(data) {
  return request({
    url: '/user/login',
    method: 'post',
    tips: 1,
    data
  })
}

export function apiDealerReceive(params) {
  return request({
    url: '/dealer/receive',
    method: 'get',
    params
  })
}

export function apiDealerReport(data) {
  return request({
    url: '/dealer/report',
    method: 'post',
    data
  })
}

export function apiDealerBase() {
  return request({
    url: '/dealer/base',
    method: 'get'
  })
}
