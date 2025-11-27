import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/layouts/index.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', requiresAuth: false }
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: () => import('@/views/ResetPassword.vue'),
    meta: { title: '重置密码', requiresAuth: false }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/Home.vue'),
        meta: { title: '首页', icon: 'HomeFilled' }
      },
      {
        path: 'progress',
        name: 'Progress',
        component: () => import('@/views/Progress.vue'),
        meta: { title: '学习进度', icon: 'DataAnalysis' }
      },
      {
        path: 'course-selection',
        name: 'CourseSelection',
        component: () => import('@/views/CourseSelection.vue'),
        meta: { title: '选课', icon: 'Document' }
      },
      {
        path: 'project-training',
        name: 'ProjectTraining',
        component: () => import('@/views/ProjectTraining.vue'),
        meta: { title: '项目实训', icon: 'Briefcase' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 检查路由是否需要认证
  if (to.meta.requiresAuth) {
    // 这里可以检查用户是否已登录
    // 暂时模拟已登录状态，实际应该从 localStorage 或 store 中获取
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
    
    if (!isAuthenticated) {
      // 未登录，跳转到登录页
      next('/login')
    } else {
      next()
    }
  } else {
    // 如果已登录访问登录页，重定向到首页
    if (to.path === '/login' && localStorage.getItem('isAuthenticated') === 'true') {
      next('/home')
    } else {
      next()
    }
  }
})

export default router
