<template>
  <div class="login-container">
    <div class="login-wrapper">
      <!-- 左侧装饰区域 -->
      <div class="login-left">
        <div class="left-content">
          <div class="logo-section">
            <el-icon :size="48" color="white">
              <School />
            </el-icon>
            <h1 class="logo-title">EduNexus</h1>
            <p class="logo-subtitle">一学分课堂学生端</p>
          </div>
          <div class="feature-list">
            <div class="feature-item">
              <el-icon :size="24" color="white"><Document /></el-icon>
              <span>丰富的课程资源</span>
            </div>
            <div class="feature-item">
              <el-icon :size="24" color="white"><DataAnalysis /></el-icon>
              <span>实时学习进度跟踪</span>
            </div>
            <div class="feature-item">
              <el-icon :size="24" color="white"><Briefcase /></el-icon>
              <span>企业项目实训</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录/注册表单区域 -->
      <div class="login-right">
        <div class="form-container">
          <!-- 切换标签 -->
          <div class="tab-switch">
            <div
              class="tab-item"
              :class="{ active: activeTab === 'login' }"
              @click="activeTab = 'login'"
            >
              登录
            </div>
            <div
              class="tab-item"
              :class="{ active: activeTab === 'register' }"
              @click="activeTab = 'register'"
            >
              注册
            </div>
          </div>

          <!-- 登录表单 -->
          <div v-show="activeTab === 'login'" class="form-content">
            <h2 class="form-title">欢迎回来</h2>
            <p class="form-subtitle">登录您的账户以继续学习</p>

            <el-form
              ref="loginFormRef"
              :model="loginForm"
              :rules="loginRules"
              class="login-form"
            >
              <el-form-item prop="username">
                <el-input
                  v-model="loginForm.username"
                  placeholder="请输入用户名或学号"
                  size="large"
                  :prefix-icon="User"
                />
              </el-form-item>

              <el-form-item prop="password">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  size="large"
                  :prefix-icon="Lock"
                  show-password
                  @keyup.enter="handleLogin"
                />
              </el-form-item>

              <div class="form-options">
                <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                <el-link type="primary" :underline="false" @click="handleForgotPassword">忘记密码？</el-link>
              </div>

              <el-button
                type="primary"
                size="large"
                class="submit-btn"
                :loading="loginLoading"
                @click="handleLogin"
              >
                {{ loginLoading ? '登录中...' : '登录' }}
              </el-button>
            </el-form>
          </div>

          <!-- 注册表单 -->
          <div v-show="activeTab === 'register'" class="form-content">
            <h2 class="form-title">创建账户</h2>
            <p class="form-subtitle">注册新账户开始学习之旅</p>

            <el-form
              ref="registerFormRef"
              :model="registerForm"
              :rules="registerRules"
              class="register-form"
            >
              <el-form-item prop="studentId">
                <el-input
                  v-model="registerForm.studentId"
                  placeholder="请输入学号"
                  size="large"
                  :prefix-icon="User"
                />
              </el-form-item>

              <el-form-item prop="username">
                <el-input
                  v-model="registerForm.username"
                  placeholder="请输入用户名"
                  size="large"
                  :prefix-icon="User"
                />
              </el-form-item>

              <el-form-item prop="email">
                <el-input
                  v-model="registerForm.email"
                  placeholder="请输入邮箱"
                  size="large"
                  :prefix-icon="Message"
                />
              </el-form-item>

              <el-form-item prop="universityName">
                <el-input
                  v-model="registerForm.universityName"
                  placeholder="请输入高校名称"
                  size="large"
                  :prefix-icon="School"
                />
              </el-form-item>

              <el-form-item prop="password">
                <el-input
                  v-model="registerForm.password"
                  type="password"
                  placeholder="请输入密码（至少6位）"
                  size="large"
                  :prefix-icon="Lock"
                  show-password
                />
              </el-form-item>

              <el-form-item prop="confirmPassword">
                <el-input
                  v-model="registerForm.confirmPassword"
                  type="password"
                  placeholder="请确认密码"
                  size="large"
                  :prefix-icon="Lock"
                  show-password
                  @keyup.enter="handleRegister"
                />
              </el-form-item>

              <el-form-item prop="agreement">
                <el-checkbox v-model="registerForm.agreement">
                  我已阅读并同意
                  <el-link type="primary" :underline="false">《用户协议》</el-link>
                  和
                  <el-link type="primary" :underline="false">《隐私政策》</el-link>
                </el-checkbox>
              </el-form-item>

              <el-button
                type="primary"
                size="large"
                class="submit-btn"
                :loading="registerLoading"
                @click="handleRegister"
              >
                {{ registerLoading ? '注册中...' : '注册' }}
              </el-button>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  School,
  User,
  Lock,
  Message,
  Document,
  DataAnalysis,
  Briefcase
} from '@element-plus/icons-vue'
import { themeColors } from '@/styles/variables.js'
import { userApi } from '@/api/user.js'

const router = useRouter()

const activeTab = ref('login')
const rememberMe = ref(false)
const loginLoading = ref(false)
const registerLoading = ref(false)

const loginFormRef = ref(null)
const registerFormRef = ref(null)

// 登录表单
const loginForm = reactive({
  username: '',
  password: ''
})

// 注册表单
const registerForm = reactive({
  studentId: '',
  username: '',
  email: '',
  universityName: '',
  password: '',
  confirmPassword: '',
  agreement: false
})

// 验证确认密码
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 验证协议
const validateAgreement = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请先阅读并同意用户协议'))
  } else {
    callback()
  }
}

// 登录表单验证规则
const loginRules = {
  username: [
    { required: true, message: '请输入用户名或学号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ]
}

// 注册表单验证规则
const registerRules = {
  studentId: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { pattern: /^\d+$/, message: '学号只能包含数字', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '用户名长度在2到20个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  universityName: [
    { required: true, message: '请输入高校名称', trigger: 'blur' },
    { min: 2, max: 50, message: '高校名称长度在2到50个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  agreement: [
    { validator: validateAgreement, trigger: 'change' }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loginLoading.value = true
      try {
        console.log('开始登录请求:', { username: loginForm.username })
        
        // 发送真实登录请求
        const response = await userApi.login({
          username: loginForm.username,
          password: loginForm.password
        })
        
        console.log('登录响应:', response)
        
        // 检查响应格式：标准格式 {code, message, data, errors}
        if (response && response.code === 401) {
          // 401错误，用户名或密码错误
          throw new Error(response.message || '用户名或密码错误')
        }
        
        // 检查是否有其他错误码
        if (response && response.code !== 200 && response.code !== 0) {
          throw new Error(response.message || '登录失败')
        }
        
        // 获取实际数据（在data字段中）
        const data = response?.data || response
        
        // 验证登录是否成功（有token或user信息）
        if (!data || (!data.token && !data.user)) {
          throw new Error('登录响应无效，请重试')
        }
        
        // 保存token和refreshToken
        if (data.token) {
          localStorage.setItem('token', data.token)
          console.log('Token已保存:', data.token)
        }
        
        // 如果响应中有refreshToken，也保存它
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken)
          console.log('RefreshToken已保存:', data.refreshToken)
        }
        
        // 从auth/me端点获取完整的用户信息
        let userInfo = null
        try {
          console.log('🔍 从auth/me获取用户信息...')
          const authUserInfo = await userApi.getAuthUserInfo()
          console.log('✅ 获取到用户信息:', authUserInfo)
          
          // 处理不同格式的响应
          if (authUserInfo && authUserInfo.data) {
            userInfo = authUserInfo.data
          } else if (authUserInfo && authUserInfo.user) {
            userInfo = authUserInfo.user
          } else {
            userInfo = authUserInfo
          }
          
          console.log('👤 处理后的用户信息:', userInfo)
        } catch (error) {
          console.error('❌ 获取用户信息失败:', error)
          console.log('🔄 使用fallback用户信息')
          
          // 如果获取用户信息失败，使用登录响应中的用户信息
          if (data.user) {
            userInfo = data.user
          } else {
            // 最后的fallback，创建基本的用户信息
            userInfo = {
              name: loginForm.username,
              username: loginForm.username
            }
          }
        }
        
        // 保存用户信息
        if (userInfo) {
          localStorage.setItem('userInfo', JSON.stringify(userInfo))
          console.log('用户信息已保存:', userInfo)
        } else {
          // 如果API没有返回用户信息，尝试使用注册时保存的临时信息
          const tempUserInfo = localStorage.getItem('tempUserInfo')
          if (tempUserInfo) {
            localStorage.setItem('userInfo', tempUserInfo)
            localStorage.removeItem('tempUserInfo') // 清除临时信息
            console.log('使用临时用户信息')
          } else {
            // 最后的fallback，创建基本的用户信息
            const basicUserInfo = {
              name: loginForm.username,
              username: loginForm.username
            }
            localStorage.setItem('userInfo', JSON.stringify(basicUserInfo))
            console.log('创建基本用户信息:', basicUserInfo)
          }
        }
        
        // 设置登录状态
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('username', loginForm.username)
        console.log('登录状态已设置')
        
        // 确保token设置后立即验证可以调用推荐课程API
        console.log('✅ 登录成功，token已保存，可以调用需要认证的API')
        
        ElMessage.success('登录成功')
        // 跳转到首页
        console.log('准备跳转到首页')
        router.push('/home')
      } catch (error) {
        console.error('登录失败:', error)
        console.error('错误详情:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        })
        
        // 处理不同类型的错误
        let errorMessage = '登录失败'
        if (error.response?.status === 401) {
          errorMessage = '用户名或密码错误'
        } else if (error.response?.status === 500) {
          errorMessage = '服务器内部错误，请稍后重试'
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.message && !error.message.includes('用户名或密码错误')) {
          errorMessage = error.message
        }
        
        console.log('显示错误消息:', errorMessage)
        ElMessage.error(errorMessage)
      } finally {
        loginLoading.value = false
      }
    } else {
      ElMessage.error('请填写完整的登录信息')
    }
  })
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      registerLoading.value = true
      
      // 准备注册数据 - 移到try外部，确保在catch中也能访问
      const registerData = {
        studentId: registerForm.studentId,
        username: registerForm.username,
        email: registerForm.email,
        universityName: registerForm.universityName,
        password: registerForm.password
      }
      
      try {
        
        // 打印调试信息
        console.log('注册数据:', registerData)
        console.log('请求URL:', 'http://192.168.1.157:8082/api/auth/register')
        
        // 发送完整注册信息到指定API
        const response = await userApi.register(registerData)
        console.log('注册响应:', response)
        
        // 详细检查响应格式
        console.log('📊 注册响应类型:', typeof response)
        console.log('📝 注册响应内容:', JSON.stringify(response, null, 2))
        
        // 检查是否为标准格式 {code, message, data, errors}
        if (response && typeof response === 'object' && 'code' in response) {
          console.log('🏷️ 标准格式响应，code:', response.code, 'message:', response.message)
          
          // 成功码判断
          const successCodes = [200, 0, 201, 204]
          if (successCodes.includes(response.code)) {
            console.log('✅ 注册成功，响应码:', response.code)
            // 注册成功，继续执行后续逻辑
          } else {
            console.log('❌ 注册失败，错误码:', response.code, '错误信息:', response.message)
            // 如果API返回了具体的错误信息，使用它；否则使用默认信息
            const errorMsg = response.message && response.message.trim() !== '' ? response.message : '注册失败'
            throw new Error(errorMsg)
          }
        } else {
          // 非标准格式，但有响应，通常表示成功
          console.log('✅ 非标准格式响应，认为注册成功')
        }
        
        ElMessage.success('注册成功，请登录')
        // 切换到登录标签
        activeTab.value = 'login'
        
        // 保存注册时的用户信息到localStorage，以备登录后使用
        const tempUserInfo = {
          name: registerForm.username,
          username: registerForm.username,
          email: registerForm.email,
          studentId: registerForm.studentId,
          universityName: registerForm.universityName
        }
        localStorage.setItem('tempUserInfo', JSON.stringify(tempUserInfo))
        
        // 清空注册表单
        Object.assign(registerForm, {
          studentId: '',
          username: '',
          email: '',
          universityName: '',
          password: '',
          confirmPassword: '',
          agreement: false
        })
        // 填充用户名到登录表单
        loginForm.username = registerForm.username
      } catch (error) {
        console.error('注册失败:', error)
        console.error('错误详情:', error.response?.data)
        console.error('发送的数据:', registerData)
        if (error.response?.data?.errors) {
          console.error('字段验证错误:', error.response.data.errors)
        }
        
        // 处理不同类型的错误
        let errorMessage = '注册失败'
        
        // 首先检查业务逻辑抛出的错误（排除空消息和"注册失败"）
        if (error.message && error.message !== '注册失败' && error.message.trim() !== '') {
          errorMessage = error.message
        } 
        // 然后检查HTTP状态码错误
        else if (error.response?.status === 409) {
          errorMessage = '用户名或学号已存在'
        } else if (error.response?.status === 400) {
          errorMessage = '输入信息有误，请检查后重试'
        } else if (error.response?.status === 500) {
          errorMessage = '服务器内部错误，请稍后重试'
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error
        } else if (error.message) {
          errorMessage = error.message
        }
        
        console.log('显示错误消息:', errorMessage)
        ElMessage.error(errorMessage)
      } finally {
        registerLoading.value = false
      }
    } else {
      ElMessage.error('请填写完整的注册信息')
    }
  })
}

// 处理忘记密码
const handleForgotPassword = async () => {
  try {
    // 使用Element Plus的输入框
    const { value: email } = await ElMessageBox.prompt(
      '请输入您的注册邮箱，我们将向您发送密码重置链接',
      '忘记密码',
      {
        confirmButtonText: '发送重置链接',
        cancelButtonText: '取消',
        inputPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        inputErrorMessage: '请输入有效的邮箱地址',
        inputPlaceholder: '请输入邮箱地址'
      }
    )

    if (!email) return

    console.log('准备发送忘记密码请求:', { email })
    console.log('请求URL:', 'http://192.168.1.157:8082/api/auth/forgot-password')

    // 发送忘记密码请求
    const response = await userApi.forgotPassword({ email })
    console.log('忘记密码响应:', response)

    // 检查响应格式
    if (response && typeof response === 'object' && 'code' in response) {
      console.log('🏷️ 忘记密码标准格式响应，code:', response.code, 'message:', response.message)
      
      const successCodes = [200, 0, 201, 204]
      if (successCodes.includes(response.code)) {
        console.log('✅ 忘记密码请求成功，响应码:', response.code)
        ElMessage.success('密码重置链接已发送到您的邮箱，请查收')
        
        // 如果响应中包含重置令牌，可以直接跳转到重置页面
        if (response.data && response.data.resetToken) {
          console.log('🔗 跳转到重置密码页面，携带令牌')
          router.push({
            path: '/reset-password',
            query: { token: response.data.resetToken }
          })
        }
      } else {
        console.log('❌ 忘记密码请求失败，错误码:', response.code, '错误信息:', response.message)
        const errorMsg = response.message && response.message.trim() !== '' ? response.message : '发送失败，请稍后重试'
        ElMessage.error(errorMsg)
      }
    } else {
      console.log('✅ 忘记密码非标准格式响应，认为成功')
      ElMessage.success('密码重置链接已发送到您的邮箱，请查收')
    }
  } catch (error) {
    if (error === 'cancel') {
      console.log('用户取消忘记密码操作')
      return
    }

    console.error('忘记密码请求失败:', error)
    console.error('错误详情:', error.response?.data)
    
    let errorMessage = '发送失败，请稍后重试'
    if (error.response?.status === 404) {
      errorMessage = '该邮箱未注册'
    } else if (error.response?.status === 400) {
      errorMessage = '邮箱格式不正确'
    } else if (error.response?.status === 500) {
      errorMessage = '服务器内部错误，请稍后重试'
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.message && !error.message.includes('取消')) {
      errorMessage = error.message
    }
    
    console.log('显示错误消息:', errorMessage)
    ElMessage.error(errorMessage)
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/main.scss';

.login-container {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(118, 175, 255, 0.1) 0%, rgba(0, 99, 221, 0.1) 100%);
  position: relative;
  overflow: hidden;

  // 背景装饰
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(118, 175, 255, 0.1) 0%, transparent 70%);
    animation: rotate 20s linear infinite;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}

.login-wrapper {
  width: 90%;
  max-width: 1200px;
  height: 85vh;
  max-height: 800px;
  display: flex;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.login-left {
  flex: 1;
  background: $gradient-primary;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 40px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('@/img/jimeng-2025-11-04-5365-现代简约风格，以渐变蓝色为主色调，从浅蓝到深蓝的柔和渐变，画面左侧有一个年轻亚洲....png');
    background-size: cover;
    background-position: center;
    opacity: 0.2;
    z-index: 0;
  }

  .left-content {
    position: relative;
    z-index: 1;
    color: white;
    width: 100%;
    max-width: 400px;

    .logo-section {
      text-align: center;
      margin-bottom: 60px;

      .logo-title {
        font-size: 48px;
        font-weight: 700;
        margin: 20px 0 10px 0;
        letter-spacing: 2px;
      }

      .logo-subtitle {
        font-size: 18px;
        opacity: 0.9;
        margin: 0;
      }
    }

    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 24px;

      .feature-item {
        display: flex;
        align-items: center;
        gap: 16px;
        font-size: 16px;
        padding: 16px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        backdrop-filter: blur(10px);
        transition: all 0.3s;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateX(10px);
        }
      }
    }
  }
}

// 自定义滚动条样式
.form-container::-webkit-scrollbar {
  width: 4px;
}

.form-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.form-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.form-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.login-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;

  .form-container {
    width: 100%;
    max-width: 420px;
    max-height: 100%;
    overflow-y: auto;
    padding-right: 8px;

    .tab-switch {
      display: flex;
      gap: 8px;
      margin-bottom: 40px;
      background: $bg-color;
      padding: 4px;
      border-radius: 12px;

      .tab-item {
        flex: 1;
        text-align: center;
        padding: 12px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 500;
        color: $text-regular;
        transition: all 0.3s;

        &:hover {
          color: $primary-color;
        }

        &.active {
          background: white;
          color: $primary-color;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }
    }

    .form-content {
      .form-title {
        font-size: 28px;
        font-weight: 700;
        color: $text-primary;
        margin: 0 0 8px 0;
      }

      .form-subtitle {
        font-size: 14px;
        color: $text-secondary;
        margin: 0 0 24px 0;
      }

      .login-form,
      .register-form {
        :deep(.el-form-item) {
          margin-bottom: 20px;
        }

        :deep(.el-input__wrapper) {
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

          &:hover {
            box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
          }
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .submit-btn {
          width: 100%;
          height: 48px;
          font-size: 16px;
          font-weight: 600;
          border-radius: 8px;
          background: $gradient-primary;
          border: none;
          margin-top: 8px;

          &:hover {
            opacity: 0.9;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
          }
        }
      }
    }
  }
}

// 自定义滚动条样式
.form-container::-webkit-scrollbar {
  width: 4px;
}

.form-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.form-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.form-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

// 响应式设计
@media (max-width: 968px) {
  .login-wrapper {
    flex-direction: column;
    height: auto;
    max-height: none;
  }

  .login-left {
    flex: none;
    min-height: 300px;
    padding: 40px 20px;

    .left-content {
      .logo-section {
        margin-bottom: 30px;

        .logo-title {
          font-size: 36px;
        }
      }

      .feature-list {
        gap: 16px;

        .feature-item {
          font-size: 14px;
          padding: 12px;
        }
      }
    }
  }

  .login-right {
    padding: 30px 20px;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 20px;
  }

  .login-wrapper {
    border-radius: 16px;
  }

  .login-left {
    min-height: 250px;
    padding: 30px 20px;

    .left-content {
      .logo-section {
        .logo-title {
          font-size: 28px;
        }

        .logo-subtitle {
          font-size: 14px;
        }
      }

      .feature-list {
        .feature-item {
          font-size: 12px;
          padding: 10px;
        }
      }
    }
  }
}

// 自定义滚动条样式
.form-container::-webkit-scrollbar {
  width: 4px;
}

.form-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 2px;
}

.form-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.form-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>

