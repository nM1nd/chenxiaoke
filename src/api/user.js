import request from '@/utils/request'

// 用户相关API
export const userApi = {
  // 用户登录
  login(data) {
    return request.post('/auth/login', data)
  },
  
  // 用户注册
  register(data) {
    return request.post('/auth/register', data)
  },
  
  // 忘记密码
  forgotPassword(data) {
    return request.post('/auth/forgot-password', data)
  },
  
  // 重置密码
  resetPassword(data) {
    return request.post('/auth/reset-password', data)
  },
  
  // 获取待办事项
  getTodos() {
    return request.get('/home/todos')
  },
  
  // 添加待办事项
  addTodo(data) {
    const requestData = {
      title: data.title,
      description: data.description || '',
      priority: data.priority || 1
    }
    
    // 处理日期格式
    if (data.deadline) {
      const date = new Date(data.deadline)
      requestData.deadline = date.toISOString().split('T')[0] // 格式化为 YYYY-MM-DD
    } else {
      requestData.deadline = null
    }
    
    console.log('📋 添加待办事项请求数据:', requestData)
    return request.post('/home/todos', requestData)
  },
  
  // 更新待办事项
  updateTodo(id, data) {
    const requestData = {
      title: data.title,
      description: data.description || '',
      priority: data.priority || 1,
      completed: data.completed
    }
    
    // 处理日期格式
    if (data.deadline) {
      const date = new Date(data.deadline)
      requestData.deadline = date.toISOString().split('T')[0] // 格式化为 YYYY-MM-DD
    } else {
      requestData.deadline = null
    }
    
    console.log('📋 更新待办事项请求数据:', requestData)
    return request.put(`/home/todos/${id}`, requestData)
  },
  
  // 删除待办事项
  deleteTodo(id) {
    return request.delete(`/home/todos/${id}`)
  },
  
  // 提交作业
  submitAssignment(assignmentId, data) {
    return request.post(`/progress/assignments/${assignmentId}/submit`, data)
  },
  
  // 获取课程列表
  getProgressCourses() {
    return request.get('/progress/courses')
  },
  
  // 获取学分获取趋势数据
  getCreditsTrend() {
    return request.get('/progress/credits-trend')
  },
  
  // 获取学习时长分布数据
  getTimeDistribution() {
    return request.get('/progress/time-distribution')
  },
  
  // 获取作业列表
  getAssignments() {
    return request.get('/progress/assignments')
  },
  
  // 获取考试列表
  getExams() {
    return request.get('/progress/exams')
  },
  
  // 获取课程详情
  getCourseDetail(courseId) {
    return request.get(`/progress/courses/${courseId}`)
  },
  
  // 获取作业详情
  getAssignmentDetail(assignmentId) {
    return request.get(`/progress/assignments/${assignmentId}`)
  },
  
  // 获取学习进度统计数据
  getProgressStats() {
    return request.get('/progress/stats')
  },
  
  // 获取学习统计图表数据
  getStudyChartData() {
    return request.get('/home/study-chart')
  },
  
  // 获取学习统计数据
  getStudyStats() {
    return request.get('/home/study-stats')
  },
  
  // 获取学生技能分布数据
  getSkillsData() {
    return request.get('/home/skills')
  },
  
  // 获取最近学习的课程
  getRecentCourses() {
    return request.get('/home/recent-courses')
  },
  
  // 获取学习日历事件
  getCalendarEvents() {
    return request.get('/home/calendar-events')
  },
  
  // 获取今日事件列表
  getTodayEvents() {
    return request.get('/home/today-events')
  },
  
  // 获取通知公告列表
  getNotices() {
    return request.get('/home/notices')
  },
  

  // 退出登录
  logout() {
    return request.post('/auth/logout')
  },
  
  // 获取用户信息 (认证端点)
  getAuthUserInfo() {
    return request.get('/auth/me')
  },
  
  // 获取用户信息
  getUserInfo() {
    return request.get('/user/info')
  },
  
  // 更新用户信息
  updateUserInfo(data) {
    return request.put('/user/info', data)
  },
  
  // 获取统计数据 (首页)
  getHomeStats() {
    return request.get('/home/stats')
  },
  
  // 获取学习统计图表数据
  getStudyChart() {
    return request.get('/home/study-chart')
  },
  
  // 获取统计数据 (用户端点)
  getStats() {
    return request.get('/user/stats')
  }
}