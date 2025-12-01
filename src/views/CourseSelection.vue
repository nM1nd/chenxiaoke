<template>
  <div class="course-selection-container">
    <div class="page-header">
      <h1 class="page-title">课程选择</h1>
      <p class="page-desc">浏览并选择您感兴趣的课程</p>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="课程分类">
          <el-select v-model="filterForm.category" placeholder="全部" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="前端开发" value="前端开发" />
            <el-option label="后端开发" value="后端开发" />
            <el-option label="数据科学" value="数据科学" />
            <el-option label="算法基础" value="算法基础" />
            <el-option label="系统架构" value="系统架构" />
          </el-select>
        </el-form-item>
        <el-form-item label="年份">
          <el-select v-model="filterForm.semester" placeholder="全部" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="2024春季" value="2024春季" />
            <el-option label="2024秋季" value="2024秋季" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索课程名称或教师"
            clearable
            style="width: 250px"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 课程推荐 -->
    <el-card class="recommendations-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>
            <el-icon><Star /></el-icon>
            为您推荐
          </span>
          <el-button type="text" size="small" @click="refreshRecommendations" :loading="recommendationsLoading">
            刷新推荐
          </el-button>
        </div>
      </template>
      
      <div v-if="recommendationsLoading" class="recommendations-loading">
        <el-skeleton :rows="3" animated />
      </div>
      
      <div v-else-if="recommendedCourses.length > 0" class="recommendations-list">
        <el-card
          v-for="course in recommendedCourses"
          :key="course.id"
          class="recommendation-card"
          shadow="hover"
          @click="handleViewDetail(course)"
        >
          <div class="recommendation-content">
            <div class="recommendation-badge">
              <el-icon><Star /></el-icon>
              <span>推荐</span>
            </div>
            <h4 class="recommendation-title">{{ course.name }}</h4>
            <p class="recommendation-desc">{{ course.description }}</p>
            <div class="recommendation-reason">
              <el-tag size="small" type="info">{{ course.recommendReason }}</el-tag>
            </div>
          </div>
        </el-card>
      </div>
      
      <el-empty v-else description="暂无推荐课程" :image-size="120" />
    </el-card>

    <!-- 已选课程提示 -->
    <el-alert
      v-if="selectedCourses.length > 0"
      :title="`已选择 ${selectedCourses.length} 门课程`"
      type="success"
      :closable="false"
      show-icon
      class="selected-alert"
    >
      <template #default>
        <div class="selected-courses-list">
          <el-tag
            v-for="course in selectedCourses"
            :key="course.id"
            closable
            @close="handleRemoveSelected(course.id)"
            class="selected-tag"
          >
            {{ course.name }}
          </el-tag>
          <el-button 
            type="primary" 
            size="small" 
            @click="handleConfirmSelection"
            :loading="confirmSelectionLoading"
          >
            确认选课
          </el-button>
        </div>
      </template>
    </el-alert>

    <!-- 课程列表 -->
    <div v-if="coursesLoading" class="courses-loading">
      <el-skeleton :rows="6" animated />
    </div>
    <div v-else class="courses-grid">
      <el-card
        v-for="course in filteredCourses"
        :key="course.id"
        class="course-card"
        shadow="hover"
      >
        <div class="course-image">
          <div 
            class="image-placeholder" 
            :style="{ 
              backgroundImage: course.backgroundImage ? `url(${course.backgroundImage})` : course.color,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }"
          >
            <div class="image-overlay"></div>
            <el-icon :size="48" color="white"><Document /></el-icon>
          </div>
          <el-tag
            v-if="course.isSelected"
            type="success"
            class="selected-badge"
          >
            已选择
          </el-tag>
        </div>

        <div class="course-content">
          <div class="course-header">
            <h3 class="course-name">{{ course.name }}</h3>
            <div class="course-credits">
              <el-icon><Star /></el-icon>
              {{ course.credits }}学分
            </div>
          </div>

          <p class="course-desc">{{ course.description }}</p>

          <div class="course-info">
            <div class="info-item">
              <el-icon><User /></el-icon>
              <span>{{ course.enterprise }}</span>
            </div>
            <div class="info-item">
              <el-icon><Calendar /></el-icon>
              <span>{{ course.semester }}</span>
            </div>
            <div class="info-item">
              <el-icon><Clock /></el-icon>
              <span>{{ course.duration }}周</span>
            </div>
            <div class="info-item">
              <el-icon><Collection /></el-icon>
              <span>{{ course.category }}</span>
            </div>
          </div>

          <div class="course-stats">
            <div class="stat-item">
              <span class="stat-label">已选人数</span>
              <span class="stat-value">{{ course.enrolled }}/{{ course.capacity }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">评分</span>
              <el-rate
                v-model="course.rating"
                disabled
                show-score
                text-color="#ff9900"
                score-template="{value}"
              />
            </div>
          </div>

          <div class="course-footer">
            <el-button
              v-if="!course.isSelected && !course.alreadySelected"
              type="primary"
              :disabled="course.enrolled >= course.capacity"
              @click="handleSelectCourse(course)"
            >
              <el-icon><Plus /></el-icon>
              {{ course.enrolled >= course.capacity ? '已满员' : '选择课程' }}
            </el-button>
            <el-button
              v-else-if="course.alreadySelected"
              disabled
            >
              <el-icon><Check /></el-icon>
              已选修
            </el-button>
            <el-button
              v-else
              type="danger"
              @click="handleUnselectCourse(course.id)"
            >
              <el-icon><Minus /></el-icon>
              取消选择
            </el-button>
            <el-button @click="handleViewDetail(course)">
              <el-icon><View /></el-icon>
              查看详情
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 36, 48]"
        :total="filteredCourses.length"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 课程详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="selectedCourseDetail?.name"
      width="900px"
    >
      <div v-if="selectedCourseDetail" class="course-detail">
        <el-tabs v-model="detailTab">
          <el-tab-pane label="基本信息" name="info">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="课程名称">
                {{ selectedCourseDetail.name }}
              </el-descriptions-item>
              <el-descriptions-item label="学分">
                {{ selectedCourseDetail.credits }}学分
              </el-descriptions-item>
              <el-descriptions-item label="课程来源">
                {{ selectedCourseDetail.enterprise }}
              </el-descriptions-item>
              <el-descriptions-item label="学期">
                {{ selectedCourseDetail.semester }}
              </el-descriptions-item>
              <el-descriptions-item label="课程分类">
                {{ selectedCourseDetail.category }}
              </el-descriptions-item>
              <el-descriptions-item label="课程时长">
                {{ selectedCourseDetail.duration }}周
              </el-descriptions-item>
              <el-descriptions-item label="已选人数" :span="2">
                {{ selectedCourseDetail.enrolled }}/{{ selectedCourseDetail.capacity }}
              </el-descriptions-item>
              <el-descriptions-item label="课程评分" :span="2">
                <el-rate
                  v-model="selectedCourseDetail.rating"
                  disabled
                  show-score
                  text-color="#ff9900"
                  score-template="{value}"
                />
              </el-descriptions-item>
              <el-descriptions-item label="课程简介" :span="2">
                {{ selectedCourseDetail.description }}
              </el-descriptions-item>
            </el-descriptions>
          </el-tab-pane>
          
          <el-tab-pane label="课程大纲" name="syllabus">
            <div class="syllabus-content">
              <h4>课程大纲</h4>
              <el-timeline>
                <el-timeline-item
                  v-for="(chapter, index) in selectedCourseDetail.syllabus"
                  :key="index"
                  :timestamp="`第${index + 1}周`"
                  placement="top"
                >
                  <h5>{{ chapter.title }}</h5>
                  <ul class="chapter-content">
                    <li v-for="(item, idx) in chapter.content" :key="idx">{{ item }}</li>
                  </ul>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="课程评价" name="reviews">
            <div class="reviews-content">
              <div class="reviews-summary">
                <div class="rating-overview">
                  <div class="rating-score">{{ selectedCourseDetail.rating }}</div>
                  <el-rate
                    v-model="selectedCourseDetail.rating"
                    disabled
                    show-score
                    text-color="#ff9900"
                    score-template="({value})"
                  />
                  <div class="rating-count">{{ selectedCourseDetail.reviews?.length || 0 }}条评价</div>
                </div>
              </div>
              <div class="reviews-list">
                <div
                  v-for="review in selectedCourseDetail.reviews"
                  :key="review.id"
                  class="review-item"
                >
                  <div class="review-header">
                    <span class="reviewer-name">{{ review.name }}</span>
                    <el-rate v-model="review.rating" disabled size="small" />
                    <span class="review-date">{{ review.date }}</span>
                  </div>
                  <p class="review-content">{{ review.content }}</p>
                </div>
                <el-empty v-if="!selectedCourseDetail.reviews || selectedCourseDetail.reviews.length === 0" description="暂无评价" />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
        <el-button
          type="primary"
          @click="handleSelectFromDetail"
          :disabled="selectedCourseDetail?.enrolled >= selectedCourseDetail?.capacity"
        >
          选择课程
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Plus,
  Minus,
  View,
  Document,
  User,
  Calendar,
  Clock,
  Collection,
  Star,
  Check
} from '@element-plus/icons-vue'
import { themeColors, courseCardColors } from '@/styles/variables.js'
import { courseApi } from '@/api'

const filterForm = ref({
  category: '',
  semester: '',
  credits: '',
  keyword: ''
})

const currentPage = ref(1)
const pageSize = ref(12)
const selectedCourses = ref([])
const detailDialogVisible = ref(false)
const selectedCourseDetail = ref(null)
const detailTab = ref('info')
const recommendedCourses = ref([])
const confirmSelectionLoading = ref(false)
const recommendationsLoading = ref(false)

// 随机背景图片数组（使用 Picsum Photos 随机图片服务）
const backgroundImages = [
  'https://picsum.photos/400/300?random=1',
  'https://picsum.photos/400/300?random=2',
  'https://picsum.photos/400/300?random=3',
  'https://picsum.photos/400/300?random=4',
  'https://picsum.photos/400/300?random=5',
  'https://picsum.photos/400/300?random=6',
  'https://picsum.photos/400/300?random=7',
  'https://picsum.photos/400/300?random=8'
]

// 为课程分配随机背景图片
const assignRandomBackground = (course, index) => {
  return {
    ...course,
    backgroundImage: backgroundImages[index % backgroundImages.length]
  }
}

const allCourses = ref([])
const coursesLoading = ref(false)

// 获取课程列表
const loadCourses = async () => {
  coursesLoading.value = true
  try {
    console.log('📚 获取课程列表...')
    const response = await courseApi.getCourses({
      page: 1,
      limit: 100 // 获取更多课程
    })
    console.log('📝 课程列表响应:', response)
    
    // 处理不同的响应格式
    let courses = []
    if (response && response.data) {
      // 如果响应有data字段
      if (Array.isArray(response.data)) {
        courses = response.data
      } else if (response.data.list && Array.isArray(response.data.list)) {
        courses = response.data.list
      }
    } else if (Array.isArray(response)) {
      // 直接是数组
      courses = response
    } else if (response && response.code && Array.isArray(response.list)) {
      // 标准格式
      courses = response.list
    }
    
    // 为课程添加必要字段并分配背景图片
    if (courses.length > 0) {
      allCourses.value = courses.map((course, index) => {
        // 确保必要字段存在
        return {
          id: course.id || index + 1,
          name: course.name || '未知课程',
          description: course.description || '暂无课程描述',
          enterprise: course.enterprise || '未知企业',
          semester: course.semester || '2024春季',
          credits: course.credits || 1,
          duration: course.duration || 16,
          category: course.category || '其他',
          enrolled: course.enrolled || 0,
          capacity: course.capacity || 50,
          rating: course.rating || 4.5,
          isSelected: false,
          alreadySelected: course.alreadySelected || false,
          backgroundImage: backgroundImages[index % backgroundImages.length],
          color: courseCardColors[index % courseCardColors.length],
          syllabus: course.syllabus || generateDefaultSyllabus(course.name),
          reviews: course.reviews || [],
          recommendReason: course.recommendReason,
          ...course // 保留其他字段
        }
      })
      console.log('✅ 课程列表加载成功，数量:', allCourses.value.length)
    } else {
      console.log('⚠️ 课程列表为空')
      allCourses.value = []
    }
    
  } catch (error) {
    console.error('❌ 获取课程列表失败:', error)
    allCourses.value = []
  } finally {
    coursesLoading.value = false
  }
}

const filteredCourses = computed(() => {
  let result = allCourses.value

  if (filterForm.value.category) {
    result = result.filter(c => c.category === filterForm.value.category)
  }

  if (filterForm.value.semester) {
    result = result.filter(c => c.semester === filterForm.value.semester)
  }

  if (filterForm.value.credits) {
    result = result.filter(c => c.credits === filterForm.value.credits)
  }

  if (filterForm.value.keyword) {
    const keyword = filterForm.value.keyword.toLowerCase()
    result = result.filter(
      c =>
        c.name.toLowerCase().includes(keyword) ||
        c.enterprise.toLowerCase().includes(keyword)
    )
  }

  return result
})

const handleSearch = () => {
  currentPage.value = 1
  ElMessage.success('搜索完成')
}

const handleReset = () => {
  filterForm.value = {
    category: '',
    semester: '',
    credits: '',
    keyword: ''
  }
  currentPage.value = 1
}

const handleSelectCourse = (course) => {
  // 检查是否已选择
  if (selectedCourses.value.find(c => c.id === course.id)) {
    ElMessage.warning('该课程已选择')
    return
  }

  // 检查是否已满员
  if (course.enrolled >= course.capacity) {
    ElMessage.error('该课程已满员，无法选择')
    return
  }

  // 检查是否已选修（在实际场景中，应该检查用户是否已经选过这门课）
  if (course.alreadySelected) {
    ElMessage.warning('您已经选修过这门课程')
    return
  }

  // 更新状态
  course.isSelected = true
  selectedCourses.value.push(course)
  
  console.log('📚 选择课程:', course.name, 'ID:', course.id)
  ElMessage.success(`已选择课程：${course.name}`)
}

const handleUnselectCourse = (courseId) => {
  const course = allCourses.value.find(c => c.id === courseId)
  if (course) {
    course.isSelected = false
  }
  selectedCourses.value = selectedCourses.value.filter(c => c.id !== courseId)
  console.log('🚫 取消选择课程，ID:', courseId)
  ElMessage.info('已取消选择')
}

const handleRemoveSelected = (courseId) => {
  handleUnselectCourse(courseId)
}

const handleConfirmSelection = async () => {
  if (selectedCourses.value.length === 0) {
    ElMessage.warning('请先选择课程')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确认选择这 ${selectedCourses.value.length} 门课程吗？`,
      '确认选课',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    // 调用API确认选课
    confirmSelectionLoading.value = true
    
    // 保存当前选择状态，以防失败时需要恢复
    const originalSelection = [...selectedCourses.value]
    const courseIds = selectedCourses.value.map(course => course.id)
    
    console.log('📚 确认选课，课程IDs:', courseIds)
    console.log('请求URL:', 'http://192.168.1.157:8082/api/courses/confirm-selection')
    console.log('提交数据:', { courseIds })
    
    const response = await courseApi.confirmSelection(courseIds)
    console.log('📝 选课确认响应:', response)
    
    // 检查响应格式
    if (response && typeof response === 'object' && 'code' in response) {
      console.log('🏷️ 选课标准格式响应，code:', response.code, 'message:', response.message)
      
      const successCodes = [200, 0, 201, 204]
      if (successCodes.includes(response.code)) {
        console.log('✅ 选课成功，响应码:', response.code)
        
        // 检查是否有部分失败的情况
        if (response.data && response.data.failedCourses && response.data.successfulCourses) {
          const successful = response.data.successfulCourses
          const failed = response.data.failedCourses
          
          if (failed.length > 0) {
            ElMessage.warning(`成功选择 ${successful.length} 门课程，${failed.length} 门课程选择失败`)
            console.log('⚠️ 部分课程选课失败:', failed)
          } else {
            ElMessage.success(`成功选择 ${successful.length} 门课程！`)
          }
          
          // 更新成功的课程状态
          successful.forEach(courseId => {
            const course = allCourses.value.find(c => c.id === courseId)
            if (course) {
              course.isSelected = false
              course.enrolled = Math.min(course.enrolled + 1, course.capacity)
            }
          })
          
          // 移除成功的课程，保留失败的让用户可以重试
          selectedCourses.value = selectedCourses.value.filter(sc => 
            failed.find(fc => fc.courseId === sc.id)
          )
          
        } else {
          // 全部成功的情况
          ElMessage.success(`成功选择 ${selectedCourses.value.length} 门课程！`)
          
          // 更新选课状态
          selectedCourses.value.forEach(selectedCourse => {
            const course = allCourses.value.find(c => c.id === selectedCourse.id)
            if (course) {
              course.isSelected = false // 重置选择状态
              course.enrolled = Math.min(course.enrolled + 1, course.capacity) // 更新已选人数
            }
          })
          
          // 清空已选课程列表
          selectedCourses.value = []
        }
        
        // 刷新推荐课程
        refreshRecommendations()
        
      } else {
        console.log('❌ 选课失败，错误码:', response.code, '错误信息:', response.message)
        const errorMsg = response.message && response.message.trim() !== '' ? response.message : '选课失败，请稍后重试'
        ElMessage.error(errorMsg)
      }
    } else {
      // 非标准格式，认为成功
      console.log('📄 选课非标准格式响应，认为成功')
      ElMessage.success(`成功选择 ${selectedCourses.value.length} 门课程！`)
      
      // 更新选课状态
      selectedCourses.value.forEach(selectedCourse => {
        const course = allCourses.value.find(c => c.id === selectedCourse.id)
        if (course) {
          course.isSelected = false
          course.enrolled = Math.min(course.enrolled + 1, course.capacity)
        }
      })
      
      selectedCourses.value = []
      refreshRecommendations()
    }
    
  } catch (error) {
    if (error === 'cancel') {
      // 用户取消操作
      return
    }
    
    console.error('选课失败:', error)
    console.error('错误详情:', error.response?.data)
    
    let errorMessage = '选课失败，请稍后重试'
    if (error.response?.status === 400) {
      errorMessage = '选课参数错误，请检查课程信息'
    } else if (error.response?.status === 403) {
      errorMessage = '选课时间已过或权限不足'
    } else if (error.response?.status === 409) {
      errorMessage = '部分课程已选或人数已满'
    } else if (error.response?.status === 500) {
      errorMessage = '服务器内部错误，请稍后重试'
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    ElMessage.error(errorMessage)
    
    // 如果是服务器错误，恢复选择状态，让用户可以重试
    if (error.response?.status >= 500) {
      console.log('🔄 服务器错误，恢复选择状态')
      selectedCourses.value = originalSelection
      originalSelection.forEach(originalCourse => {
        const course = allCourses.value.find(c => c.id === originalCourse.id)
        if (course) {
          course.isSelected = true
        }
      })
    }
  } finally {
    confirmSelectionLoading.value = false
  }
}

const handleViewDetail = (course) => {
  // 确保课程有完整数据
  const fullCourse = allCourses.value.find(c => c.id === course.id) || course
  selectedCourseDetail.value = {
    ...fullCourse,
    syllabus: fullCourse.syllabus || generateDefaultSyllabus(fullCourse.name),
    reviews: fullCourse.reviews || []
  }
  detailDialogVisible.value = true
  detailTab.value = 'info'
}

const generateDefaultSyllabus = (courseName) => {
  return [
    {
      title: '课程介绍',
      content: [`${courseName}基础概念`, '课程目标', '学习要求']
    },
    {
      title: '核心内容',
      content: ['理论知识学习', '实践操作', '案例分析']
    },
    {
      title: '项目实践',
      content: ['项目规划', '开发实践', '总结与反思']
    }
  ]
}

// 课程推荐逻辑
const refreshRecommendations = async () => {
  recommendationsLoading.value = true
  try {
    console.log('🌟 获取推荐课程...')
    console.log('请求URL: http://192.168.1.157:8082/api/courses/recommended')
    
    // 检查是否有有效的token
    const token = localStorage.getItem('token')
    console.log('🔑 当前token状态:', token ? '已存在' : '不存在')
    if (token) {
      console.log('🔑 Token信息:', token.substring(0, 20) + '...')
    } else {
      console.warn('⚠️ 没有token，推荐课程API可能失败')
    }
    
    const response = await courseApi.getRecommendedCourses()
    console.log('📝 推荐课程响应:', response)
    
    // 处理不同的响应格式
    let courses = []
    if (response && response.data) {
      // 如果响应有data字段
      if (Array.isArray(response.data)) {
        courses = response.data
      } else if (response.data.list && Array.isArray(response.data.list)) {
        courses = response.data.list
      }
    } else if (Array.isArray(response)) {
      // 直接是数组
      courses = response
    } else if (response && response.code && Array.isArray(response.list)) {
      // 标准格式
      courses = response.list
    }
    
    // 处理推荐课程数据
    if (courses.length > 0) {
      // 为推荐课程添加推荐原因
      recommendedCourses.value = courses.map(course => {
        // 查找对应的完整课程信息
        const fullCourse = allCourses.value.find(c => c.id === course.id)
        return {
          ...fullCourse,
          ...course,
          recommendReason: course.recommendReason || getRecommendReason(course)
        }
      })
      console.log('✅ 推荐课程加载成功，数量:', recommendedCourses.value.length)
    } else {
      console.log('⚠️ 推荐课程为空')
      recommendedCourses.value = []
    }
    
  } catch (error) {
    console.error('❌ 获取推荐课程失败:', error)
    recommendedCourses.value = []
    
    // 特殊处理认证错误
    if (error.message === 'NEED_AUTH' || error.response?.status === 401) {
      console.warn('🔐 推荐课程需要认证，可能需要重新登录')
      ElMessage.warning('请先登录以获取推荐课程')
      
      // 清除无效的认证信息
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('isAuthenticated')
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限访问推荐课程')
    } else if (error.response?.status >= 500) {
      ElMessage.error('服务器错误，请稍后重试')
    } else {
      ElMessage.error('获取推荐课程失败，请稍后重试')
    }
  } finally {
    recommendationsLoading.value = false
  }
}

// 根据课程属性生成推荐原因
const getRecommendReason = (course) => {
  if (course.rating >= 4.8) return '高评分课程'
  if (course.enrolled / course.capacity >= 0.8) return '热门课程'
  if (course.category === '前端开发' || course.category === '后端开发') return '技术热门'
  return '为您推荐'
}

// 组件初始化
onMounted(async () => {
  // 同时加载课程列表和推荐课程
  await Promise.all([
    loadCourses(),
    refreshRecommendations()
  ])
})

const handleSelectFromDetail = () => {
  if (selectedCourseDetail.value) {
    handleSelectCourse(selectedCourseDetail.value)
    detailDialogVisible.value = false
  }
}

const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val) => {
  currentPage.value = val
}
</script>

<style lang="scss" scoped>
@import '@/styles/main.scss';

.course-selection-container {
  .page-header {
    margin-bottom: 24px;

    .page-title {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: $text-primary;
    }

    .page-desc {
      font-size: 14px;
      color: $text-secondary;
      margin: 0;
    }
  }

  .filter-card {
    margin-bottom: 20px;
    border: none;

    .filter-form {
      margin: 0;
    }
  }

  .selected-alert {
    margin-bottom: 20px;

    .selected-courses-list {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 12px;

      .selected-tag {
        margin-right: 8px;
      }
    }
  }

  .courses-loading {
    margin-bottom: 24px;
    padding: 40px;
  }

  .courses-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 20px;
    margin-bottom: 24px;

    .course-card {
      border: none;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-4px);
      }

      .course-image {
        position: relative;
        margin: -20px -20px 16px -20px;
        border-radius: 8px 8px 0 0;
        overflow: hidden;

        .image-placeholder {
          height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;

          .image-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.3);
            z-index: 1;
          }

          .el-icon {
            position: relative;
            z-index: 2;
          }
        }

        .selected-badge {
          position: absolute;
          top: 12px;
          right: 12px;
        }
      }

      .course-content {
        .course-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;

          .course-name {
            font-size: 18px;
            font-weight: 600;
            margin: 0;
            color: $text-primary;
            flex: 1;
          }

          .course-credits {
            display: flex;
            align-items: center;
            gap: 4px;
            color: $danger-color;
            font-weight: 600;
            white-space: nowrap;
            margin-left: 12px;
          }
        }

        .course-desc {
          font-size: 14px;
          color: $text-regular;
          line-height: 1.6;
          margin: 0 0 16px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .course-info {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 16px;
          padding: 12px;
          background: $bg-color;
          border-radius: 8px;

          .info-item {
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 13px;
            color: $text-regular;

            .el-icon {
              color: $text-secondary;
            }
          }
        }

        .course-stats {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          padding-top: 16px;
          border-top: 1px solid #ebeef5;

          .stat-item {
            display: flex;
            flex-direction: column;
            gap: 4px;

            .stat-label {
              font-size: 12px;
              color: $text-secondary;
            }

            .stat-value {
              font-size: 14px;
              font-weight: 600;
              color: #303133;
            }
          }
        }

        .course-footer {
          display: flex;
          gap: 8px;
        }
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 24px;
  }

  .recommendations-card {
    margin-bottom: 20px;
    border: none;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .recommendations-loading {
      padding: 20px;
    }

    .recommendations-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;

      .recommendation-card {
        cursor: pointer;
        border: 2px solid transparent;
        transition: all 0.3s;

        &:hover {
          border-color: $primary-color;
          transform: translateY(-4px);
        }

        .recommendation-content {
          position: relative;

          .recommendation-badge {
            position: absolute;
            top: -8px;
            right: -8px;
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 4px 8px;
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            color: #333;
            box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
          }

          .recommendation-title {
            font-size: 16px;
            font-weight: 600;
            margin: 0 0 8px 0;
            color: $text-primary;
          }

          .recommendation-desc {
            font-size: 13px;
            color: $text-regular;
            margin: 0 0 8px 0;
            line-height: 1.5;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
      }
    }
  }

  .course-detail {
    :deep(.el-descriptions__label) {
      font-weight: 600;
    }

    .syllabus-content {
      h4 {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 16px 0;
        color: $text-primary;
      }

      h5 {
        font-size: 14px;
        font-weight: 600;
        margin: 0 0 8px 0;
        color: $text-primary;
      }

      .chapter-content {
        margin: 8px 0;
        padding-left: 20px;
        color: $text-regular;
        line-height: 1.8;

        li {
          margin-bottom: 4px;
        }
      }
    }

    .reviews-content {
      .reviews-summary {
        margin-bottom: 24px;
        padding: 20px;
        background: $bg-color;
        border-radius: 8px;

        .rating-overview {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;

          .rating-score {
            font-size: 48px;
            font-weight: 700;
            color: $primary-color;
          }

          .rating-count {
            font-size: 14px;
            color: $text-secondary;
          }
        }
      }

      .reviews-list {
        .review-item {
          padding: 16px;
          margin-bottom: 16px;
          background: $bg-color;
          border-radius: 8px;

          .review-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;

            .reviewer-name {
              font-weight: 600;
              color: $text-primary;
            }

            .review-date {
              margin-left: auto;
              font-size: 12px;
              color: $text-secondary;
            }
          }

          .review-content {
            font-size: 14px;
            color: $text-regular;
            line-height: 1.6;
            margin: 0;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .course-selection-container {
    .courses-grid {
      grid-template-columns: 1fr;
    }
  }
}
</style>
