<template>
  <el-container class="layout-container">
    <!-- 顶部导航栏 -->
    <el-header class="layout-header">

      <div class="header-content">
        <div class="logo-section">
          <el-icon :size="28" color="white">
            <School />
          </el-icon>
          
          <span class="logo-text">一学分课堂</span>
          <el-tag type="info" size="small" class="logo-tag">学生端</el-tag>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="36" :src="userInfo.avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <span class="username">{{ userInfo.name }}</span>
              <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  <span>个人中心</span>
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  <span>设置</span>
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  <span>退出登录</span>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
    </el-header>

    <el-container class="layout-body">
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '240px'" class="layout-aside">
        <div class="collapse-btn" @click="toggleCollapse">
          <el-icon><Fold v-if="!isCollapse" /><Expand v-else /></el-icon>
        </div>
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          class="sidebar-menu"
        >
          <el-menu-item
            v-for="route in menuRoutes"
            :key="route.path"
            :index="route.path"
          >
            <el-icon>
              <component :is="route.meta.icon" />
            </el-icon>
            <template #title>{{ route.meta.title }}</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="layout-main">
        <div class="main-content">
          <router-view v-slot="{ Component }">
            <transition name="fade-transform" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </el-main>
    </el-container>
    <el-footer class="layout-footer" height="auto">
      <AppFooter />
    </el-footer>
    <!-- 全局 AI 助手浮动按钮 -->
    <AiAssistant />
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  School,
  User,
  ArrowDown,
  Setting,
  SwitchButton,
  Fold,
  Expand
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { userApi } from '@/api'
import AiAssistant from '@/components/AiAssistant.vue'
import AppFooter from '@/components/AppFooter.vue'

const route = useRoute()
const router = useRouter()
const isCollapse = ref(false)

const userInfo = ref({
  name: '同学',
  avatar: '',
  studentId: ''
})

// 页面加载时获取用户信息
const initUserInfo = () => {
  try {
    // 优先从localStorage获取用户信息
    const savedUserInfo = localStorage.getItem('userInfo')
    if (savedUserInfo) {
      const parsedUserInfo = JSON.parse(savedUserInfo)
      userInfo.value = {
        name: parsedUserInfo.name || parsedUserInfo.username || '同学',
        avatar: parsedUserInfo.avatar || '',
        studentId: parsedUserInfo.studentId || ''
      }
    } else {
      // 其次使用登录时保存的用户名
      const username = localStorage.getItem('username')
      if (username) {
        userInfo.value = {
          name: username,
          avatar: '',
          studentId: ''
        }
      }
    }
  } catch (error) {
    console.error('获取布局用户信息失败:', error)
  }
}

// 组件挂载时初始化用户信息
initUserInfo()

const menuRoutes = computed(() => {
  return route.matched[0]?.children || []
})

const activeMenu = computed(() => {
  return route.path
})

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人中心功能开发中')
      break
    case 'settings':
      ElMessage.info('设置功能开发中')
      break
    case 'logout':
      try {
        // 发送退出登录请求到API
        await userApi.logout()
        ElMessage.success('退出登录成功')
      } catch (error) {
        console.error('退出登录请求失败:', error)
        // 即使API请求失败，也继续本地退出
        ElMessage.success('已退出登录')
      }
      
      // 清除登录状态
      localStorage.removeItem('isAuthenticated')
      localStorage.removeItem('username')
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      localStorage.removeItem('tempUserInfo')
      
      // 跳转到登录页
      router.push('/login')
      break
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/main.scss';

.layout-container {
  height: 100vh;
  background: $bg-color;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.layout-body {
  flex: 1;
  overflow: hidden;
  display: flex;
}

.layout-header {
  height: 64px !important;
  padding: 0;
  background: $gradient-primary;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-bottom: none;

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 0 24px;

    .logo-section {
      display: flex;
      align-items: center;
      gap: 12px;
      color: white;

      .logo-text {
        font-size: 24px;
        font-weight: 700;
        letter-spacing: 1px;
      }

      .logo-tag {
        margin-left: 8px;
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
      }
    }

    .header-right {
      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        padding: 8px 16px;
        border-radius: 24px;
        transition: background 0.3s;
        color: white;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .username {
          font-size: 14px;
          font-weight: 500;
        }

        .dropdown-icon {
          font-size: 12px;
        }
      }
    }
  }
}

.layout-aside {
  background: rgba(255, 255, 255, 0.6);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  transition: width 0.3s;
  position: relative;
  height: 100%;
  overflow-y: auto;

  // 背景图片：位于侧边栏下方，透明度自下而上衰减
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    /* 使用绝对路径，确保在样式中能正确解析资源 */
    background-image: url('/src/img/jimeng-2025-11-04-8998-精致复杂的图标设计风格，纯白色背景，立体书本堆叠图标，3-4本书籍呈阶梯状堆叠，....png');
    background-repeat: no-repeat;
    /* 仅在侧栏下半部分显示，缩小占比 */
    background-size: auto 45%;
    background-position: center bottom;
    z-index: 0; // 背景层
    // 使用 mask 实现由下到上的透明衰减
    /* 自下而上衰减，显示范围更靠下 */
    -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.0) 40%);
    mask-image: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 20%, rgba(0,0,0,0.0) 40%);
    pointer-events: none;
  }

  .collapse-btn {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.3s;
    z-index: 10;
    color: $text-regular;

    &:hover {
      background: $bg-color;
    }
  }

  .sidebar-menu {
    border-right: none;
    padding-top: 56px;
    height: 100%;
    position: relative;
    z-index: 1; // 菜单层在背景之上
    background-color: transparent !important;
    :deep(.el-menu-item) {
      background-color: transparent !important;
    }

    :deep(.el-menu-item) {
      height: 56px;
      line-height: 56px;
      margin: 4px 12px;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        background: $bg-hover;
        color: $primary-color;
      }

      &.is-active {
        background: $gradient-primary;
        color: white;

        .el-icon {
          color: white;
        }
      }

      .el-icon {
        width: 24px;
        text-align: center;
      }
    }

    // 折叠状态下菜单项的样式
    &.el-menu--collapse {
      :deep(.el-menu-item) {
        margin: 4px 12px;
        padding-left: 20px !important;
        padding-right: 20px !important;
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;

        .el-icon {
          margin: 0;
          flex-shrink: 0;
          width: 24px;
        }
      }

      // 隐藏菜单项中的文字
      :deep(.el-menu-item > span) {
        display: none;
      }

      // 确保tooltip触发器居中
      :deep(.el-menu-item > .el-menu-tooltip__trigger) {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0;
      }

      // 移除Element Plus默认的padding
      :deep(.el-menu-item.is-active) {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }
    }
  }
}

.layout-main {
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  height: 100%;

  .main-content {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
    min-height: fit-content;
  }
}

.layout-footer {
  padding: 0;
  background: transparent;
}

.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
