import request from '@/utils/request'

export const courseApi = {
  // 获取课程列表
  getCourses(params) {
    return request.get('/courses', { params })
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
  },
  
  // 获取推荐课程
  getRecommendedCourses() {
    console.log('📡 调用推荐课程API: /courses/recommended')
    return request.get('/courses/recommended')
  }
}