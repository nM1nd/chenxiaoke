// API配置文件
export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.157:8082/api',
  ENDPOINTS: {
    // 认证相关
    LOGIN: '/auth/login',
    REGISTER: '/auth/register', 
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH_TOKEN: '/auth/refresh-token',
    
    // 课程相关
    COURSES: '/courses',
    COURSE_DETAIL: (id) => `/courses/${id}`,
    SELECTED_COURSES: '/courses/selected',
    SELECT_COURSE: (id) => `/courses/${id}/select`,
    CONFIRM_SELECTION: '/courses/confirm-selection',
    RECOMMENDED_COURSES: '/courses/recommended',
    
    // 用户相关
    USER_INFO: '/user/info',
    USER_STATS: '/user/stats',
    
    // 作业相关
    ASSIGNMENTS: '/assignments',
    SUBMIT_ASSIGNMENT: (id) => `/assignments/${id}/submit`,
    
    // 待办事项
    TODOS: '/todos',
    TODO_DETAIL: (id) => `/todos/${id}`
  }
}

// 获取完整的API URL
export const getApiUrl = (endpoint) => {
  return API_CONFIG.BASE_URL + endpoint
}