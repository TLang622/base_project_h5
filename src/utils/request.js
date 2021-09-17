import axios from 'axios'
import { Toast } from 'vant';
import { getToken, removeToken } from '@/utils/token'

// 正在进行中的请求列表
let reqList = []
//白名单
let whitelist = ['/phone/samples', '/ident/samples']

/**
 * 阻止重复请求
 * @param {array} reqList - 请求缓存列表
 * @param {string} url - 当前请求地址
 * @param {function} cancel - 请求中断函数
 * @param {string} errorMessage - 请求中断时需要显示的错误信息
 */
const stopRepeatRequest = function (reqList, url, cancel, errorMessage) {
  let t = false
  for (let i = 0; i < whitelist.length; i++) {
    if (whitelist[i] === url) {
      t = true
    }
  }
  if(t) {
    return
  }
  const errorMsg = errorMessage || ''
  for (let i = 0; i < reqList.length; i++) {
    if (reqList[i] === url) {
      cancel(errorMsg)
      return
    }
  }
  reqList.push(url)
}

/**
 * 允许某个请求可以继续进行
 * @param {array} reqList 请求缓存列表
 * @param {string} url 请求地址
 */
const allowRequest = function (reqList, url) {
  for (let i = 0; i < reqList.length; i++) {
    if (reqList[i] === url) {
      reqList.splice(i, 1)
      break
    }
  }
}

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
    let cancel
    // 设置cancelToken对象
    config.cancelToken = new axios.CancelToken(function(c) {
      cancel = c
    })
    // 阻止重复请求。当上个请求未完成时，相同的请求不会进行
    stopRepeatRequest(reqList, config.url, cancel, `${config.url} 请求被中断`)
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
    // 增加延迟，相同请求不得在短时间内重复发送
    setTimeout(() => {
      allowRequest(reqList, response.config.url)
    }, 1000)
    const res = response.data
    const code = res.code
    if (code !== 200) {
      let msg = '接口出错'
      if (res.msg) {
        msg = res.msg
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
      Toast({
        message: msg,
        position: 'top',
      })
      return Promise.reject(new Error(msg))
    } else {
      if (response.config.method === 'post' || response.config.method === 'put' || response.config.method === 'delete') {
        if(response.config.tips !== 1) {
          Toast({
            message: '操作成功',
            position: 'top',
          })
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
    Toast({
      message: msg,
      position: 'top',
    })
    return Promise.reject(error)
  }
)

export default service
