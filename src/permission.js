import router from './router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { getToken, removeToken } from '@/utils/token'

NProgress.configure({ showSpinner: false })
const whiteList = ['/login']

if (process.env.NODE_ENV === 'development') {
  // setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1ZTU3YjNlYjlkNWUzZTc2YzJiNjdlMjYiLCJpYXQiOjE1ODI4MDg2ODksImlzcyI6IndvbmRmb2Nsb3VkbmNvdjIwMjAiLCJuYmYiOjE1ODI4MDg2ODksInN1YiI6IjVlNTdiM2ViOWQ1ZTNlNzZjMmI2N2UyNiJ9.C8KnXANmhvQqS2UW8koXfJjgkI8w_JFZ94aUDUY7kE0')
}

router.beforeEach(async(to, from, next) => {
  NProgress.start()
  const token = getToken()
  if (token) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      const info = sessionStorage.getItem('info')
      if(info) {
        next()
      } else {
        removeToken()
        next('/login')
        NProgress.done()
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next()
      // next('/login')
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
