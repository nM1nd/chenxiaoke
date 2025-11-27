import axios from 'axios'
import router from '@/router'

// 创建axios实例
const request = axios.create({
  baseURL: 'http://192.168.1.132:8082/api', // 后端API基础URL
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 打印请求信息
    console.log('发送请求:', {
      url: config.baseURL + config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    })
    
    // 添加token等认证信息
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 检查响应数据格式
    const data = response.data
    console.log('🔍 响应拦截器收到数据:', JSON.stringify(data, null, 2))
    
    // 如果返回的是标准格式 {code, message, data, errors}
    if (data && typeof data === 'object' && 'code' in data) {
      console.log('📋 标准格式响应，code:', data.code, 'message:', data.message)
      
      // 如果是401错误，不要在拦截器中处理，让业务逻辑处理
      if (data.code === 401) {
        console.log('⚠️ 401错误，返回业务逻辑处理')
        return data  // 直接返回，让login组件处理
      }
      
      // 对于其他错误码，也直接返回，让业务逻辑判断
      if (data.code !== 200 && data.code !== 0) {
        console.log('❌ 非200/0错误码，返回业务逻辑处理')
        return data  // 直接返回，让业务逻辑处理
      }
      
      console.log('✅ 成功响应，code:', data.code)
    } else {
      console.log('📄 非标准格式响应')
    }
    
    // 正常响应或非标准格式，直接返回
    return data
  },
  error => {
    console.log('🚨 HTTP错误:', error.response?.status, error.message)
    
    // 只处理HTTP层面的错误（网络错误、服务器错误等）
    if (error.response?.status === 401) {
      // 401错误，清除认证信息
      localStorage.removeItem('token')
      localStorage.removeItem('isAuthenticated')
      
      // 只有在非登录页面时才跳转到登录页
      const currentPath = router.currentRoute.value.path
      if (currentPath !== '/login') {
        router.push('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default request