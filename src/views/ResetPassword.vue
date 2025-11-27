<template>
  <div class="reset-password-container">
    <div class="reset-password-wrapper">
      <!-- 左侧装饰区域 -->
      <div class="reset-left">
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
              <el-icon :size="24" color="white"><Lock /></el-icon>
              <span>安全密码重置</span>
            </div>
            <div class="feature-item">
              <el-icon :size="24" color="white"><Message /></el-icon>
              <span>邮箱验证保护</span>
            </div>
            <div class="feature-item">
              <el-icon :size="24" color="white"><User /></el-icon>
              <span>账户安全管理</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧重置密码表单区域 -->
      <div class="reset-right">
        <div class="form-container">
          <div class="form-content">
            <h2 class="form-title">重置密码</h2>
            <p class="form-subtitle">请设置您的新密码</p>

            <el-form
              ref="resetFormRef"
              :model="resetForm"
              :rules="resetRules"
              class="reset-form"
            >
              <el-form-item prop="token" v-if="!token">
                <el-input
                  v-model="resetForm.token"
                  placeholder="请输入重置令牌（从邮件中获取）"
                  size="large"
                  :prefix-icon="Key"
                />
              </el-form-item>

              <el-form-item prop="password">
                <el-input
                  v-model="resetForm.password"
                  type="password"
                  placeholder="请输入新密码（至少6位）"
                  size="large"
                  :prefix-icon="Lock"
                  show-password
                />
              </el-form-item>

              <el-form-item prop="confirmPassword">
                <el-input
                  v-model="resetForm.confirmPassword"
                  type="password"
                  placeholder="请确认新密码"
                  size="large"
                  :prefix-icon="Lock"
                  show-password
                  @keyup.enter="handleResetPassword"
                />
              </el-form-item>

              <el-button
                type="primary"
                size="large"
                class="submit-btn"
                :loading="resetLoading"
                @click="handleResetPassword"
              >
                {{ resetLoading ? '重置中...' : '重置密码' }}
              </el-button>

              <div class="back-to-login">
                <el-link type="primary" :underline="false" @click="goToLogin">
                  返回登录
                </el-link>
              </div>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  School,
  User,
  Lock,
  Message,
  Key
} from '@element-plus/icons-vue'
import { userApi } from '@/api/user.js'

const router = useRouter()
const route = useRoute()

const resetLoading = ref(false)
const resetFormRef = ref(null)
const token = ref('')

// 重置密码表单
const resetForm = reactive({
  token: '',
  password: '',
  confirmPassword: ''
})

// 验证确认密码
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== resetForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 重置密码表单验证规则
const resetRules = {
  token: [
    { required: true, message: '请输入重置令牌', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

// 页面加载时检查URL中的token参数
onMounted(() => {
  const urlToken = route.query.token
  if (urlToken) {
    token.value = urlToken
    resetForm.token = urlToken
    ElMessage.success('已自动填充重置令牌')
  }
})

// 处理重置密码
const handleResetPassword = async () => {
  if (!resetFormRef.value) return

  await resetFormRef.value.validate(async (valid) => {
    if (valid) {
      resetLoading.value = true
      
      try {
        // 准备重置密码数据
        const resetData = {
          token: resetForm.token,
          password: resetForm.password,
          confirmPassword: resetForm.confirmPassword
        }
        
        console.log('重置密码数据:', resetData)
        console.log('请求URL:', 'http://192.168.1.132:8082/api/auth/reset-password')
        
        // 发送重置密码请求
        const response = await userApi.resetPassword(resetData)
        console.log('重置密码响应:', response)

        // 检查响应格式
        if (response && typeof response === 'object' && 'code' in response) {
          console.log('🏷️ 重置密码标准格式响应，code:', response.code, 'message:', response.message)
          
          const successCodes = [200, 0, 201, 204]
          if (successCodes.includes(response.code)) {
            console.log('✅ 重置密码成功，响应码:', response.code)
            ElMessage.success('密码重置成功！请使用新密码登录')
            // 延迟跳转到登录页
            setTimeout(() => {
              router.push('/login')
            }, 2000)
          } else {
            console.log('❌ 重置密码失败，错误码:', response.code, '错误信息:', response.message)
            const errorMsg = response.message && response.message.trim() !== '' ? response.message : '重置失败，请稍后重试'
            ElMessage.error(errorMsg)
          }
        } else {
          console.log('✅ 重置密码非标准格式响应，认为成功')
          ElMessage.success('密码重置成功！请使用新密码登录')
          setTimeout(() => {
            router.push('/login')
          }, 2000)
        }
      } catch (error) {
        console.error('重置密码失败:', error)
        console.error('错误详情:', error.response?.data)
        
        let errorMessage = '重置失败，请稍后重试'
        if (error.response?.status === 400) {
          errorMessage = '重置令牌无效或已过期'
        } else if (error.response?.status === 404) {
          errorMessage = '重置令牌不存在'
        } else if (error.response?.status === 500) {
          errorMessage = '服务器内部错误，请稍后重试'
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        } else if (error.message) {
          errorMessage = error.message
        }
        
        console.log('显示错误消息:', errorMessage)
        ElMessage.error(errorMessage)
      } finally {
        resetLoading.value = false
      }
    } else {
      ElMessage.error('请填写完整的重置信息')
    }
  })
}

// 返回登录页
const goToLogin = () => {
  router.push('/login')
}
</script>

<style lang="scss" scoped>
@import '@/styles/main.scss';

.reset-password-container {
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

.reset-password-wrapper {
  width: 90%;
  max-width: 1000px;
  height: 80vh;
  max-height: 700px;
  display: flex;
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.reset-left {
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

.reset-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: white;

  .form-container {
    width: 100%;
    max-width: 420px;

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

      .reset-form {
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

        .back-to-login {
          text-align: center;
          margin-top: 20px;
          font-size: 14px;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 968px) {
  .reset-password-wrapper {
    flex-direction: column;
    height: auto;
    max-height: none;
  }

  .reset-left {
    flex: none;
    min-height: 250px;
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

  .reset-right {
    padding: 30px 20px;
  }
}

@media (max-width: 480px) {
  .reset-password-container {
    padding: 20px;
  }

  .reset-password-wrapper {
    border-radius: 16px;
  }

  .reset-left {
    min-height: 200px;
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
</style>