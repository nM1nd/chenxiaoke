import request from '@/utils/request'

export const courseApi = {
  // 获取课程列表
  getCourses(params) {
    return request.get('/courses', { params }).catch(error => {
      // 如果是401错误，返回mock数据
      if (error.response?.status === 401) {
        console.log('认证失败，返回mock课程数据')
        return {
          list: [
            {
              id: 1,
              name: 'Vue.js前端开发',
              enterprise: '李氏企业',
              credits: 1,
              progress: 65,
              status: '进行中'
            },
            {
              id: 2,
              name: 'Python数据分析',
              enterprise: '王氏企业',
              credits: 1,
              progress: 80,
              status: '进行中'
            },
            {
              id: 3,
              name: '数据库系统原理',
              enterprise: '张氏企业',
              credits: 1,
              progress: 100,
              status: '已完成'
            }
          ],
          total: 3
        }
      }
      // 其他错误则重新抛出
      throw error
    })
  },
  
  // 选课
  selectCourse(courseId) {
    return request.post(`/courses/${courseId}/select`)
  },
  
  // 获取学习进度
  getProgress(courseId) {
    return request.get(`/courses/${courseId}/progress`)
  },
  
  // 确认选课
  confirmSelection(courseIds) {
    return request.post('/courses/confirm-selection', { courseIds })
  }
}