import axios from 'axios'
import { Notify } from 'vant';
import { getToken, removeToken } from '@/utils/token'

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API,
  withCredentials: false,
  timeout: 10000
})

service.interceptors.request.use(
  config => {
    if (getToken()) {
      config.headers['Authorization'] = getToken()
    }
    return config
  },
  error => {
    console.log(error)
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    // console.log(response)
    const res = response.data
    const code = res.extra.code
    if (code !== 200) {
      let msg = 'ajax error'
      if (res.extra.msg) {
        msg = res.extra.msg
      }
      if (code === 401) {
        msg = '身份验证失败，请重新登录'
        removeToken()
      } else if (code === 609) {
        msg = '登陆过期，请重新登录'
        removeToken()
      } else if (code === 500) {
        msg = '出错啦，请稍后访问'
      }
      return Promise.reject(new Error(msg))
    } else {
      if (response.config.method === 'post' || response.config.method === 'put' || response.config.method === 'delete') {
        if(response.config.tips !== 1) {
          Notify({ type: 'success', message: '操作成功' })
        }
      }
      return res
    }
  },
  error => {
    console.log(error.toJSON())
    console.log(error.response)
    let msg = error.message
    let code
    if (error.response) {
      code = error.response.status
    }
    if (error.response && error.response.data && error.response.data.extra) {
      msg = error.response.data.extra.msg
    }
    if (code === 401) {
      msg = '身份验证失败，请重新登录'
      removeToken()
    } else if (code === 609) {
      msg = '登陆过期，请重新登录'
      removeToken()
    } else if (code === 500) {
      msg = '出错啦，请稍后访问'
    }
    if (msg.indexOf('timeout') !== -1 && msg.indexOf('exceeded') !== -1) {
      msg = '网络不好，请检查网络'
    }
    Notify({ type: 'danger', message: msg })
    return Promise.reject(error)
  }
)

export default service
