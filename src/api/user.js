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
  
  // 获取作业详情
  getAssignmentDetail(assignmentId) {
    return request.get(`/progress/assignments/${assignmentId}`)
  },
  

  // 退出登录
  logout() {
    return request.post('/auth/logout')
  },
  
  // 获取用户信息
  getUserInfo() {
    return request.get('/user/info').catch(error => {
      // 如果是401错误，返回mock数据
      if (error.response?.status === 401) {
        console.log('认证失败，返回mock用户信息')
        return {
          name: localStorage.getItem('username') || '同学',
          username: localStorage.getItem('username') || 'user'
        }
      }
      // 其他错误则重新抛出
      throw error
    })
  },
  
  // 更新用户信息
  updateUserInfo(data) {
    return request.put('/user/info', data)
  },
  
  // 获取统计数据
  getStats() {
    return request.get('/user/stats').catch(error => {
      // 如果是401错误，返回mock数据
      if (error.response?.status === 401) {
        console.log('认证失败，返回mock统计数据')
        return {
          totalCourses: 8,
          completionRate: 75,
          completedCourses: 6,
          ongoingCourses: 2
        }
      }
      // 其他错误则重新抛出
      throw error
    })
  }
}