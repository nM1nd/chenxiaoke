import axios from 'axios'
import router from '@/router'
import { API_CONFIG } from '@/config/api'

// 创建axios实例
const request = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 获取token的函数
const refreshToken = async () => {
  try {
    console.log('🔄 尝试刷新token...')
    console.log('📡 刷新Token URL:', API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.REFRESH_TOKEN)
    
    // 检查是否已有refresh token
    const existingRefreshToken = localStorage.getItem('refreshToken')
    const requestBody = existingRefreshToken ? { refreshToken: existingRefreshToken } : {}
    
    console.log('📤 刷新Token请求数据:', requestBody)
    
    const response = await axios.post(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.REFRESH_TOKEN, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    console.log('📝 Token刷新响应:', response.data)
    
    // 检查响应格式
    const data = response.data
    if (data && (data.token || data.data?.token)) {
      const token = data.token || data.data.token
      localStorage.setItem('token', token)
      
      // 如果响应中有新的refresh token，保存它
      if (data.refreshToken || data.data?.refreshToken) {
        const newRefreshToken = data.refreshToken || data.data.refreshToken
        localStorage.setItem('refreshToken', newRefreshToken)
      }
      
      console.log('✅ Token刷新成功:', token.substring(0, 20) + '...')
      return token
    } else {
      console.log('❌ Token刷新失败，响应中没有token')
      return null
    }
  } catch (error) {
    console.error('🚨 Token刷新失败:', error.response?.data || error.message)
    
    // 如果是401错误（refresh token无效），清除过期的tokens
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      console.log('🗑️ 已清除过期的tokens，需要重新登录')
    }
    
    return null
  }
}

// 获取初始token的函数（用于开发/测试）
const getInitialToken = async () => {
  try {
    console.log('🔑 尝试获取初始token...')
    
    // 尝试一些可能的测试端点
    const testEndpoints = [
      '/api/auth/guest-token',
      '/api/auth/dev-token', 
      '/api/auth/test-token'
    ]
    
    for (const endpoint of testEndpoints) {
      try {
        const response = await axios.post(API_CONFIG.BASE_URL + endpoint, {}, {
          headers: {
            'Content-Type': 'application/json'
          }
        })
        
        const data = response.data
        if (data && (data.token || data.data?.token)) {
          const token = data.token || data.data.token
          localStorage.setItem('token', token)
          console.log('✅ 初始token获取成功:', token.substring(0, 20) + '...')
          return token
        }
      } catch (err) {
        console.log(`端点 ${endpoint} 不可用`)
      }
    }
    
    console.log('❌ 无法获取初始token，可能需要用户登录')
    return null
  } catch (error) {
    console.error('🚨 获取初始token失败:', error.message)
    return null
  }
}

// 请求拦截器
request.interceptors.request.use(
  async (config) => {
    // 打印请求信息
    console.log('发送请求:', {
      url: config.baseURL + config.url,
      method: config.method,
      data: config.data,
      headers: config.headers
    })
    
    let token = localStorage.getItem('token')
    
    // 如果没有token，尝试刷新或获取新token
    if (!token) {
      token = await refreshToken()
      
      // 如果刷新失败，尝试获取初始token
      if (!token) {
        token = await getInitialToken()
      }
    }
    
    // 如果有token，添加到请求头
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔑 已添加Authorization头:', `Bearer ${token.substring(0, 20)}...`)
    } else {
      console.log('⚠️ 没有有效的token，请求可能会失败')
      
      // 对于需要认证的API，可以在这里跳过请求或返回特定错误
      if (config.url.includes('/courses/recommended') || config.url.includes('/user')) {
        console.warn('🚨 需要认证的API缺少token:', config.url)
        throw new Error('NEED_AUTH')
      }
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
      localStorage.removeItem('refreshToken')
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