<template>
  <div class="progress-container">
    <div class="page-header">
      <h1 class="page-title">学习进度</h1>
      <p class="page-desc">查看您的课程学习进度和学分获取情况</p>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="stat in statistics" :key="stat.label">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-content">
            <div class="stat-icon" :style="{ background: stat.color }">
              <el-icon :size="24">
                <component :is="stat.icon" />
              </el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stat.value }}</div>
              <div class="stat-label">{{ stat.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 筛选和搜索 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="课程状态">
          <el-select v-model="filterForm.status" placeholder="全部" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="进行中" value="进行中" />
            <el-option label="已完成" value="已完成" />
            <el-option label="未开始" value="未开始" />
          </el-select>
        </el-form-item>
        <el-form-item label="学期">
          <el-select v-model="filterForm.semester" placeholder="全部" clearable style="width: 150px">
            <el-option label="全部" value="" />
            <el-option label="2024春季" value="2024春季" />
            <el-option label="2023秋季" value="2023秋季" />
            <el-option label="2023春季" value="2023春季" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="filterForm.keyword"
            placeholder="搜索课程名称"
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

    <!-- 课程列表 -->
    <el-card class="courses-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>我的课程</span>
          <el-button type="primary" text @click="$router.push('/course-selection')">
            添加课程
            <el-icon><Plus /></el-icon>
          </el-button>
        </div>
      </template>

      <div class="courses-list">
        <el-card
          v-for="course in filteredCourses"
          :key="course.id"
          class="course-item"
          shadow="hover"
        >
          <div class="course-main">
            <div class="course-info">
              <div class="course-header-info">
                <h3 class="course-name">{{ course.name }}</h3>
                <el-tag :type="getStatusType(course.status)" size="small">
                  {{ course.status }}
                </el-tag>
              </div>
              <div class="course-meta">
                <span class="meta-item">
                  <el-icon><User /></el-icon>
                  {{ course.enterprise }}
                </span>
                <span class="meta-item">
                  <el-icon><Calendar /></el-icon>
                  {{ course.semester }}
                </span>
                <span class="meta-item">
                  <el-icon><Star /></el-icon>
                  {{ course.credits }}学分
                </span>
              </div>
            </div>

            <div class="course-progress-section">
              <div class="progress-header">
                <span>学习进度</span>
                <span class="progress-percent">{{ course.progress }}%</span>
              </div>
              <el-progress
                :percentage="course.progress"
                :color="getProgressColor(course.progress)"
                :stroke-width="10"
                :show-text="false"
              />
              <div class="progress-details">
                <span>已学习：{{ course.learnedHours }}小时 / {{ course.totalHours }}小时</span>
                <span>已完成作业：{{ course.completedAssignments }} / {{ course.totalAssignments }}</span>
              </div>
            </div>

            <div class="course-actions">
              <el-button type="primary" @click="handleContinue(course.id)">
                <el-icon><VideoPlay /></el-icon>
                继续学习
              </el-button>
              <el-button @click="handleViewDetail(course.id)">
                <el-icon><Document /></el-icon>
                查看详情
              </el-button>
            </div>
          </div>
        </el-card>

        <el-empty v-if="filteredCourses.length === 0" description="暂无课程数据" />
      </div>
    </el-card>

    <!-- 数据可视化图表 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <span>学分获取趋势</span>
          </template>
          <v-chart :option="creditsChartOption" style="height: 300px" />
        </el-card>
      </el-col>
      <el-col :xs="24" :md="12">
        <el-card class="chart-card" shadow="never">
          <template #header>
            <span>课程学习时长分布</span>
          </template>
          <v-chart :option="timeDistributionOption" style="height: 300px" />
        </el-card>
      </el-col>
    </el-row>

    <!-- 作业/考试管理 -->
    <el-card class="assignments-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>作业与考试</span>
          <el-tabs v-model="assignmentTab" @tab-change="handleTabChange">
            <el-tab-pane label="待提交作业" name="homework" />
            <el-tab-pane label="即将考试" name="exam" />
          </el-tabs>
        </div>
      </template>
      
      <div v-if="assignmentTab === 'homework'">
        <div v-if="homeworkList.length > 0">
          <div
            v-for="item in homeworkList"
            :key="item.id"
            class="assignment-item"
          >
            <div class="assignment-info">
              <div class="assignment-header">
                <h4 class="assignment-title">{{ item.title }}</h4>
                <el-tag :type="getDeadlineTagType(item.deadline)" size="small">
                  {{ formatDeadline(item.deadline) }}
                </el-tag>
              </div>
              <p class="assignment-desc">
                <el-icon><Document /></el-icon>
                {{ item.courseName }} · {{ item.enterprise }}
              </p>
              <div class="assignment-meta">
                <span>提交状态：</span>
                <el-tag :type="item.submitted ? 'success' : 'warning'" size="small">
                  {{ item.submitted ? '已提交' : '未提交' }}
                </el-tag>
                <span style="margin-left: 16px">分数：</span>
                <span v-if="item.score !== null" class="score">{{ item.score }}分</span>
                <span v-else class="score-placeholder">待评分</span>
              </div>
            </div>
            <div class="assignment-actions">
              <el-button v-if="!item.submitted" type="primary" size="small" @click="handleOpenSubmitDialog(item)">
                <el-icon><Upload /></el-icon>
                提交作业
              </el-button>
              <el-button size="small">
                <el-icon><View /></el-icon>
                查看详情
              </el-button>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无待提交作业" />
      </div>

      <div v-else>
        <div v-if="examList.length > 0">
          <div
            v-for="item in examList"
            :key="item.id"
            class="assignment-item"
          >
            <div class="assignment-info">
              <div class="assignment-header">
                <h4 class="assignment-title">{{ item.title }}</h4>
                <el-tag :type="getDeadlineTagType(item.date)" size="small">
                  {{ formatDeadline(item.date) }}
                </el-tag>
              </div>
              <p class="assignment-desc">
                <el-icon><Calendar /></el-icon>
                {{ item.courseName }} · {{ item.location }}
              </p>
              <div class="assignment-meta">
                <span>考试时间：{{ item.time }}</span>
                <span style="margin-left: 16px">时长：{{ item.duration }}分钟</span>
              </div>
            </div>
            <div class="assignment-actions">
              <el-button type="primary" size="small">
                <el-icon><Document /></el-icon>
                查看详情
              </el-button>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无即将到来的考试" />
      </div>
    </el-card>

    <!-- 作业提交对话框 -->
    <el-dialog
      v-model="showSubmitDialog"
      title="提交作业"
      width="600px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div v-if="currentAssignment" class="submit-dialog-content">
        <div class="assignment-info-summary">
          <h4>{{ currentAssignment.title }}</h4>
          <p class="course-info">{{ currentAssignment.courseName }} · {{ currentAssignment.enterprise }}</p>
        </div>

        <el-form :model="submitForm" label-width="80px">
          <el-form-item label="作业内容">
            <el-input
              v-model="submitForm.content"
              type="textarea"
              :rows="6"
              placeholder="请输入作业内容或说明..."
              maxlength="1000"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="附件">
            <el-upload
              v-model:file-list="fileList"
              :auto-upload="false"
              :on-change="handleFileUpload"
              :on-remove="removeFile"
              :before-upload="beforeUpload"
              multiple
              action=""
              :limit="5"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip,.rar"
            >
              <el-button type="primary">
                <el-icon><Upload /></el-icon>
                选择文件
              </el-button>
              <template #tip>
                <div class="el-upload__tip">
                  支持格式：pdf、doc、docx、txt、jpg、png、zip、rar，单个文件不超过10MB，最多5个文件
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showSubmitDialog = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="handleSubmitAssignment">
            提交作业
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 课程详情对话框 -->
    <el-dialog
      v-model="showCourseDetailDialog"
      title="课程详情"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div v-loading="courseDetailLoading" class="course-detail-content">
        <div v-if="currentCourseDetail" class="course-detail-info">
          <!-- 基本信息 -->
          <div class="course-basic-info">
            <div class="course-header">
              <h2 class="course-title">{{ currentCourseDetail.name }}</h2>
              <el-tag :type="getStatusType(currentCourseDetail.status)" size="large">
                {{ currentCourseDetail.status }}
              </el-tag>
            </div>
            
            <div class="course-meta-grid">
              <div class="meta-item">
                <div class="meta-label">所属企业</div>
                <div class="meta-value">{{ currentCourseDetail.enterprise }}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">授课教师</div>
                <div class="meta-value">{{ currentCourseDetail.teacher }}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">学期</div>
                <div class="meta-value">{{ currentCourseDetail.semester }}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">学分</div>
                <div class="meta-value">{{ currentCourseDetail.credits }}学分</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">难度等级</div>
                <div class="meta-value">{{ currentCourseDetail.difficulty }}</div>
              </div>
              <div class="meta-item">
                <div class="meta-label">开课时间</div>
                <div class="meta-value">{{ currentCourseDetail.startDate }} 至 {{ currentCourseDetail.endDate }}</div>
              </div>
            </div>
          </div>

          <!-- 学习进度 -->
          <div class="course-progress-info">
            <h3>学习进度</h3>
            <div class="progress-stats">
              <div class="progress-item">
                <div class="progress-label">总体进度</div>
                <el-progress
                  :percentage="currentCourseDetail.progress"
                  :color="getProgressColor(currentCourseDetail.progress)"
                  :stroke-width="12"
                />
                <div class="progress-text">{{ currentCourseDetail.progress }}%</div>
              </div>
              <div class="time-stats">
                <div class="time-item">
                  <div class="time-label">学习时长</div>
                  <div class="time-value">{{ currentCourseDetail.learnedHours }}h / {{ currentCourseDetail.totalHours }}h</div>
                </div>
                <div class="time-item">
                  <div class="time-label">作业完成</div>
                  <div class="time-value">{{ currentCourseDetail.completedAssignments }} / {{ currentCourseDetail.totalAssignments }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 课程描述 -->
          <div v-if="currentCourseDetail.description" class="course-description">
            <h3>课程描述</h3>
            <p>{{ currentCourseDetail.description }}</p>
          </div>

          <!-- 课程大纲 -->
          <div v-if="currentCourseDetail.syllabus && currentCourseDetail.syllabus.length > 0" class="course-syllabus">
            <h3>课程大纲</h3>
            <el-timeline>
              <el-timeline-item
                v-for="(chapter, index) in currentCourseDetail.syllabus"
                :key="index"
                :timestamp="chapter.duration || ''"
                placement="top"
              >
                <el-card>
                  <h4>{{ chapter.title || `第${index + 1}章` }}</h4>
                  <p>{{ chapter.description || '' }}</p>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>

          <!-- 标签 -->
          <div v-if="currentCourseDetail.tags && currentCourseDetail.tags.length > 0" class="course-tags">
            <h3>课程标签</h3>
            <div class="tags-container">
              <el-tag
                v-for="tag in currentCourseDetail.tags"
                :key="tag"
                class="tag-item"
                type="info"
                size="small"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showCourseDetailDialog = false">关闭</el-button>
          <el-button type="primary" @click="handleContinue(currentCourseDetail.id)">
            <el-icon><VideoPlay /></el-icon>
            继续学习
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Search,
  Plus,
  User,
  Calendar,
  Star,
  VideoPlay,
  Document,
  TrendCharts,
  DataAnalysis,
  Trophy,
  Clock,
  Collection,
  Upload,
  View
} from '@element-plus/icons-vue'
import { themeColors } from '@/styles/variables.js'
import { userApi } from '@/api'

const router = useRouter()

const filterForm = ref({
  status: '',
  semester: '',
  keyword: ''
})

const assignmentTab = ref('homework')

// 作业提交相关
const showSubmitDialog = ref(false)
const currentAssignment = ref(null)
const submitForm = ref({
  content: '',
  attachments: []
})
const submitLoading = ref(false)
const fileList = ref([])

// 课程详情相关
const showCourseDetailDialog = ref(false)
const currentCourseDetail = ref(null)
const courseDetailLoading = ref(false)

const statistics = ref([])
const creditsTrendData = ref({
  categories: [],
  credits: []
})

const timeDistributionData = ref([])

const courses = ref([
  {
    id: 1,
    name: 'Vue.js前端开发',
    enterprise: '李氏企业',
    semester: '2024春季',
    credits: 1,
    status: '进行中',
    progress: 65,
    learnedHours: 26,
    totalHours: 40,
    completedAssignments: 5,
    totalAssignments: 8
  },
  {
    id: 2,
    name: 'Python数据分析',
    enterprise: '王氏企业',
    semester: '2024春季',
    credits: 1,
    status: '进行中',
    progress: 80,
    learnedHours: 32,
    totalHours: 40,
    completedAssignments: 6,
    totalAssignments: 8
  },
  {
    id: 3,
    name: '数据库系统原理',
    enterprise: '张氏企业',
    semester: '2023秋季',
    credits: 1,
    status: '已完成',
    progress: 100,
    learnedHours: 40,
    totalHours: 40,
    completedAssignments: 8,
    totalAssignments: 8
  },
  {
    id: 4,
    name: '数据结构与算法',
    enterprise: '刘氏企业',
    semester: '2024春季',
    credits: 1,
    status: '进行中',
    progress: 45,
    learnedHours: 18,
    totalHours: 40,
    completedAssignments: 3,
    totalAssignments: 8
  },
  {
    id: 5,
    name: '计算机网络',
    enterprise: '陈氏企业',
    semester: '2023秋季',
    credits: 1,
    status: '已完成',
    progress: 100,
    learnedHours: 40,
    totalHours: 40,
    completedAssignments: 8,
    totalAssignments: 8
  },
])

const filteredCourses = computed(() => {
  let result = courses.value

  if (filterForm.value.status) {
    result = result.filter(c => c.status === filterForm.value.status)
  }

  if (filterForm.value.semester) {
    result = result.filter(c => c.semester === filterForm.value.semester)
  }

  if (filterForm.value.keyword) {
    const keyword = filterForm.value.keyword.toLowerCase()
    result = result.filter(c => c.name.toLowerCase().includes(keyword))
  }

  return result
})

const handleSearch = () => {
  ElMessage.success('搜索完成')
}

const handleReset = () => {
  filterForm.value = {
    status: '',
    semester: '',
    keyword: ''
  }
}

const handleContinue = (courseId) => {
  ElMessage.info(`继续学习课程 ${courseId}`)
}

const handleViewDetail = async (courseId) => {
  try {
    console.log('🔍 获取课程详情，课程ID:', courseId)
    console.log('请求URL:', `http://192.168.1.157:8082/api/progress/courses/${courseId}`)
    
    courseDetailLoading.value = true
    currentCourseDetail.value = null
    showCourseDetailDialog.value = true
    
    const response = await userApi.getCourseDetail(courseId)
    console.log('📝 课程详情响应:', response)
    
    // 检查响应格式
    if (response && typeof response === 'object' && 'code' in response) {
      console.log('🏷️ 课程详情标准格式响应，code:', response.code, 'message:', response.message)
      
      const successCodes = [200, 0, 201, 204]
      if (successCodes.includes(response.code)) {
        console.log('✅ 获取课程详情成功，响应码:', response.code)
        const data = response.data || response || {}
        
        // 处理数据格式，确保课程详情有必要的字段
        currentCourseDetail.value = {
          id: data.id || courseId,
          name: data.name || data.title || '未知课程',
          enterprise: data.enterprise || data.company || '未知企业',
          semester: data.semester || '未知学期',
          credits: data.credits || 0,
          status: data.status || '未知状态',
          progress: data.progress || 0,
          learnedHours: data.learnedHours || data.learned_hours || 0,
          totalHours: data.totalHours || data.total_hours || 0,
          completedAssignments: data.completedAssignments || data.completed_assignments || 0,
          totalAssignments: data.totalAssignments || data.total_assignments || 0,
          description: data.description || '',
          syllabus: data.syllabus || [],
          teacher: data.teacher || '未知教师',
          startDate: data.startDate || data.start_date || '',
          endDate: data.endDate || data.end_date || '',
          difficulty: data.difficulty || '中等',
          tags: data.tags || []
        }
      } else {
        console.log('❌ 获取课程详情失败，错误码:', response.code, '错误信息:', response.message)
        ElMessage.error(response.message || '获取课程详情失败')
        showCourseDetailDialog.value = false
      }
    } else {
      // 非标准格式，直接使用响应数据
      console.log('📄 课程详情非标准格式响应，直接使用数据')
      const data = response || {}
      currentCourseDetail.value = {
        id: data.id || courseId,
        name: data.name || data.title || '未知课程',
        enterprise: data.enterprise || data.company || '未知企业',
        semester: data.semester || '未知学期',
        credits: data.credits || 0,
        status: data.status || '未知状态',
        progress: data.progress || 0,
        learnedHours: data.learnedHours || data.learned_hours || 0,
        totalHours: data.totalHours || data.total_hours || 0,
        completedAssignments: data.completedAssignments || data.completed_assignments || 0,
        totalAssignments: data.totalAssignments || data.total_assignments || 0,
        description: data.description || '',
        syllabus: data.syllabus || [],
        teacher: data.teacher || '未知教师',
        startDate: data.startDate || data.start_date || '',
        endDate: data.endDate || data.end_date || '',
        difficulty: data.difficulty || '中等',
        tags: data.tags || []
      }
    }
  } catch (error) {
    console.error('获取课程详情失败:', error)
    console.error('错误详情:', error.response?.data)
    
    let errorMessage = '获取课程详情失败，请稍后重试'
    if (error.response?.status === 404) {
      errorMessage = '课程不存在'
    } else if (error.response?.status === 403) {
      errorMessage = '没有权限查看该课程'
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    ElMessage.error(errorMessage)
    showCourseDetailDialog.value = false
  } finally {
    courseDetailLoading.value = false
  }
}

// 作业提交相关函数
const handleOpenSubmitDialog = (assignment) => {
  currentAssignment.value = assignment
  submitForm.value = {
    content: '',
    attachments: []
  }
  fileList.value = []
  showSubmitDialog.value = true
}

const handleSubmitAssignment = async () => {
  if (!currentAssignment.value) return
  
  if (!submitForm.value.content.trim()) {
    ElMessage.warning('请输入作业内容')
    return
  }
  
  // 确认提交
  try {
    await ElMessageBox.confirm(
      `确定要提交作业"${currentAssignment.value.title}"吗？提交后将无法修改。`,
      '确认提交',
      {
        confirmButtonText: '确定提交',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
  } catch {
    // 用户取消提交
    return
  }
  
  try {
    submitLoading.value = true
    console.log('📤 提交作业，作业ID:', currentAssignment.value.id)
    console.log('请求URL:', `http://192.168.1.157:8082/api/progress/assignments/${currentAssignment.value.id}/submit`)
    console.log('提交数据:', submitForm.value)
    
    const submitData = {
      content: submitForm.value.content,
      attachments: submitForm.value.attachments.map(file => ({
        name: file.name,
        url: file.url || URL.createObjectURL(file),
        size: file.size
      }))
    }
    
    const response = await userApi.submitAssignment(currentAssignment.value.id, submitData)
    console.log('📝 提交作业响应:', response)
    
    // 检查响应格式
    if (response && typeof response === 'object' && 'code' in response) {
      console.log('🏷️ 提交作业标准格式响应，code:', response.code, 'message:', response.message)
      
      const successCodes = [200, 0, 201, 204]
      if (successCodes.includes(response.code)) {
        console.log('✅ 提交作业成功，响应码:', response.code)
        ElMessage.success('作业提交成功！')
        
        // 更新作业状态为已提交
        if (currentAssignment.value) {
          currentAssignment.value.submitted = true
          // 同时更新homeworkList中的作业状态
          const homeworkItem = homeworkList.value.find(item => item.id === currentAssignment.value.id)
          if (homeworkItem) {
            homeworkItem.submitted = true
          }
        }
        
        // 关闭对话框
        showSubmitDialog.value = false
        
        // 清空表单数据
        submitForm.value = {
          content: '',
          attachments: []
        }
        fileList.value = []
      } else {
        console.log('❌ 提交作业失败，错误码:', response.code, '错误信息:', response.message)
        const errorMsg = response.message && response.message.trim() !== '' ? response.message : '提交失败，请稍后重试'
        ElMessage.error(errorMsg)
      }
    } else {
      // 非标准格式，认为成功
      console.log('📄 提交作业非标准格式响应，认为成功')
      ElMessage.success('作业提交成功！')
      
      if (currentAssignment.value) {
        currentAssignment.value.submitted = true
        // 同时更新homeworkList中的作业状态
        const homeworkItem = homeworkList.value.find(item => item.id === currentAssignment.value.id)
        if (homeworkItem) {
          homeworkItem.submitted = true
        }
      }
      showSubmitDialog.value = false
      
      // 清空表单数据
      submitForm.value = {
        content: '',
        attachments: []
      }
      fileList.value = []
    }
  } catch (error) {
    console.error('提交作业失败:', error)
    console.error('错误详情:', error.response?.data)
    
    let errorMessage = '提交失败，请稍后重试'
    if (error.response?.status === 400) {
      errorMessage = '作业内容不能为空或格式不正确'
    } else if (error.response?.status === 403) {
      errorMessage = '作业已截止，无法提交'
    } else if (error.response?.status === 404) {
      errorMessage = '作业不存在'
    } else if (error.response?.status === 500) {
      errorMessage = '服务器内部错误，请稍后重试'
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    ElMessage.error(errorMessage)
  } finally {
    submitLoading.value = false
  }
}

const beforeUpload = (file) => {
  // 检查文件大小
  const maxSize = 10 * 1024 * 1024 // 10MB
  if (file.size > maxSize) {
    ElMessage.error(`文件 "${file.name}" 超过10MB限制`)
    return false
  }
  
  // 检查文件类型
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/zip',
    'application/x-rar-compressed'
  ]
  
  if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|txt|jpg|jpeg|png|zip|rar)$/i)) {
    ElMessage.error(`文件 "${file.name}" 格式不支持`)
    return false
  }
  
  return true // 阻止自动上传
}

const handleFileUpload = (uploadFile) => {
  // 因为设置了auto-upload=false，这里直接更新文件列表
  fileList.value = uploadFile
  submitForm.value.attachments = uploadFile
}

const removeFile = (file, fileList) => {
  // 同步更新两个数组
  submitForm.value.attachments = fileList
  console.log('移除文件:', file.name)
}

const getStatusType = (status) => {
  const map = {
    '进行中': 'success',
    '已完成': 'info',
    '未开始': 'warning'
  }
  return map[status] || 'info'
}

const getProgressColor = (percentage) => {
  if (percentage < 50) return themeColors.dangerColor
  if (percentage < 80) return themeColors.warningColor
  return themeColors.successColor
}

// 作业列表
const homeworkList = ref([])

// 考试列表
const examList = ref([])

// 学分获取趋势图表
const creditsChartOption = computed(() => {
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: creditsTrendData.value.categories || ['2023春', '2023秋', '2024春', '2024秋'],
      axisLine: {
        lineStyle: {
          color: themeColors.chartColors.axisLine
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '学分',
      axisLine: {
        lineStyle: {
          color: themeColors.chartColors.axisLine
        }
      },
      splitLine: {
        lineStyle: {
          color: themeColors.chartColors.splitLine
        }
      }
    },
    series: [
      {
        name: '累计学分',
        type: 'line',
        smooth: true,
        data: [6, 12, 20, 20],
        itemStyle: {
          color: themeColors.chartColors.series1
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: themeColors.chartColors.gradientAreaStart },
              { offset: 1, color: themeColors.chartColors.gradientAreaEnd }
            ]
          }
        }
      },
      {
        name: '学期学分',
        type: 'bar',
        data: creditsTrendData.value.credits || [6, 6, 8, 0],
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: themeColors.chartColors.gradientEnd },
              { offset: 1, color: themeColors.chartColors.gradientStart }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        }
      }
    ]
  }
})

// 学习时长分布图表
const timeDistributionOption = computed(() => {
  // 使用API数据，如果没有数据则使用默认数据
  const data = timeDistributionData.value.length > 0 ? timeDistributionData.value : [
    { value: 26, name: 'Vue.js前端开发', itemStyle: { color: themeColors.chartColors.series1 } },
    { value: 32, name: 'Python数据分析', itemStyle: { color: themeColors.chartColors.series2 } },
    { value: 18, name: '数据结构与算法', itemStyle: { color: themeColors.chartColors.series3 } },
    { value: 12, name: '操作系统原理', itemStyle: { color: themeColors.chartColors.series4 } }
  ]
  
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}小时 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle'
    },
    series: [
      {
        name: '学习时长',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}: {c}h'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        data: data
      }
    ]
  }
})

// 格式化截止日期
const formatDeadline = (deadline) => {
  if (!deadline) return ''
  const date = new Date(deadline)
  const today = new Date()
  const diffTime = date - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return '已过期'
  if (diffDays === 0) return '今天截止'
  if (diffDays === 1) return '明天截止'
  if (diffDays <= 7) return `${diffDays}天后截止`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const getDeadlineTagType = (deadline) => {
  if (!deadline) return 'info'
  const date = new Date(deadline)
  const today = new Date()
  const diffTime = date - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'danger'
  if (diffDays <= 2) return 'warning'
  return 'success'
}

const handleTabChange = (tab) => {
  // 切换标签页
}

// 获取学习进度统计数据
const fetchProgressStats = async () => {
  try {
    console.log('📊 获取学习进度统计数据...')
    console.log('请求URL: http://192.168.1.132:8082/api/progress/stats')
    
    const response = await userApi.getProgressStats()
    console.log('📝 学习进度统计响应:', response)
    
    // 检查响应格式
    if (response && typeof response === 'object' && 'code' in response) {
      console.log('🏷️ 学习进度统计标准格式响应，code:', response.code, 'message:', response.message)
      
      const successCodes = [200, 0, 201, 204]
      if (successCodes.includes(response.code)) {
        console.log('✅ 获取学习进度统计成功，响应码:', response.code)
        statistics.value = response.data || response || []
      } else {
        console.log('❌ 获取学习进度统计失败，错误码:', response.code, '错误信息:', response.message)
        // 使用默认统计数据作为fallback
        statistics.value = [
          {
            label: '总课程数',
            value: '8',
            icon: 'Collection',
            color: themeColors.gradientPrimary
          },
          {
            label: '已获学分',
            value: '24',
            icon: 'Trophy',
            color: themeColors.gradientPink
          },
          {
            label: '平均进度',
            value: '75%',
            icon: 'DataAnalysis',
            color: themeColors.gradientBlue
          },
          {
            label: '学习时长',
            value: '120h',
            icon: 'Clock',
            color: themeColors.gradientGreen
          }
        ]
      }
    } else {
      // 非标准格式，直接使用响应数据
      console.log('📄 学习进度统计非标准格式响应，直接使用数据')
      statistics.value = Array.isArray(response) ? response : []
    }
  } catch (error) {
    console.error('获取学习进度统计失败:', error)
    console.error('错误详情:', error.response?.data)
    
    // 如果API失败，使用默认统计数据作为fallback
    statistics.value = [
      {
        label: '总课程数',
        value: '8',
        icon: 'Collection',
        color: themeColors.gradientPrimary
      },
      {
        label: '已获学分',
        value: '24',
        icon: 'Trophy',
        color: themeColors.gradientPink
      },
      {
        label: '平均进度',
        value: '75%',
        icon: 'DataAnalysis',
        color: themeColors.gradientBlue
      },
      {
        label: '学习时长',
        value: '120h',
        icon: 'Clock',
        color: themeColors.gradientGreen
      }
    ]
  }
}

// 获取课程列表
const fetchProgressCourses = async () => {
  try {
    console.log('📚 获取课程列表...')
    console.log('请求URL: http://192.168.1.132:8082/api/progress/courses')
    
    const response = await userApi.getProgressCourses()
    console.log('📝 课程列表响应:', response)
    
    // 检查响应格式
    if (response && typeof response === 'object' && 'code' in response) {
      console.log('🏷️ 课程列表标准格式响应，code:', response.code, 'message:', response.message)
      
      const successCodes = [200, 0, 201, 204]
      if (successCodes.includes(response.code)) {
        console.log('✅ 获取课程列表成功，响应码:', response.code)
        courses.value = response.data || response || []
      } else {
        console.log('❌ 获取课程列表失败，错误码:', response.code, '错误信息:', response.message)
        // 使用默认课程数据作为fallback
        courses.value = [
          {
            id: 1,
            name: 'Vue.js前端开发',
            enterprise: '李氏企业',
            semester: '2024春季',
            credits: 1,
            status: '进行中',
            progress: 65,
            learnedHours: 26,
            totalHours: 40,
            completedAssignments: 5,
            totalAssignments: 8
          },
          {
            id: 2,
            name: 'Python数据分析',
            enterprise: '王氏企业',
            semester: '2024春季',
            credits: 1,
            status: '进行中',
            progress: 80,
            learnedHours: 32,
            totalHours: 40,
            completedAssignments: 6,
            totalAssignments: 8
          }
        ]
      }
    } else {
      // 非标准格式，直接使用响应数据
      console.log('📄 课程列表非标准格式响应，直接使用数据')
      courses.value = Array.isArray(response) ? response : []
    }
  } catch (error) {
    console.error('获取课程列表失败:', error)
    console.error('错误详情:', error.response?.data)
    
    // 如果API失败，使用默认课程数据作为fallback
    courses.value = [
      {
        id: 1,
        name: 'Vue.js前端开发',
        enterprise: '李氏企业',
        semester: '2024春季',
        credits: 1,
        status: '进行中',
        progress: 65,
        learnedHours: 26,
        totalHours: 40,
        completedAssignments: 5,
        totalAssignments: 8
      },
      {
        id: 2,
        name: 'Python数据分析',
        enterprise: '王氏企业',
        semester: '2024春季',
        credits: 1,
        status: '进行中',
        progress: 80,
        learnedHours: 32,
        totalHours: 40,
        completedAssignments: 6,
        totalAssignments: 8
      }
    ]
  }
}

// 获取学分获取趋势数据
const fetchCreditsTrend = async () => {
  try {
    console.log('📈 获取学分获取趋势数据...')
    console.log('请求URL: http://192.168.1.132:8082/api/progress/credits-trend')
    
    const response = await userApi.getCreditsTrend()
    console.log('📝 学分趋势响应:', response)
    
    // 检查响应格式
    if (response && typeof response === 'object' && 'code' in response) {
      console.log('🏷️ 学分趋势标准格式响应，code:', response.code, 'message:', response.message)
      
      const successCodes = [200, 0, 201, 204]
      if (successCodes.includes(response.code)) {
        console.log('✅ 获取学分趋势成功，响应码:', response.code)
        const data = response.data || response || {}
        creditsTrendData.value = {
          categories: data.categories || ['2023春', '2023秋', '2024春', '2024秋'],
          credits: data.credits || [6, 6, 8, 0]
        }
      } else {
        console.log('❌ 获取学分趋势失败，错误码:', response.code, '错误信息:', response.message)
        // 使用默认学分趋势数据作为fallback
        creditsTrendData.value = {
          categories: ['2023春', '2023秋', '2024春', '2024秋'],
          credits: [6, 6, 8, 0]
        }
      }
    } else {
      // 非标准格式，直接使用响应数据
      console.log('📄 学分趋势非标准格式响应，直接使用数据')
      creditsTrendData.value = {
        categories: response.categories || ['2023春', '2023秋', '2024春', '2024秋'],
        credits: response.credits || [6, 6, 8, 0]
      }
    }
  } catch (error) {
    console.error('获取学分趋势失败:', error)
    console.error('错误详情:', error.response?.data)
    
    // 如果API失败，使用默认学分趋势数据作为fallback
    creditsTrendData.value = {
      categories: ['2023春', '2023秋', '2024春', '2024秋'],
      credits: [6, 6, 8, 0]
    }
  }
}

// 获取学习时长分布数据
const fetchTimeDistribution = async () => {
  try {
    console.log('⏰ 获取学习时长分布数据...')
    console.log('请求URL: http://192.168.1.157:8082/api/progress/time-distribution')
    
    const response = await userApi.getTimeDistribution()
    console.log('📝 学习时长分布响应:', response)
    
    // 检查响应格式
    if (response && typeof response === 'object' && 'code' in response) {
      console.log('🏷️ 学习时长分布标准格式响应，code:', response.code, 'message:', response.message)
      
      const successCodes = [200, 0, 201, 204]
      if (successCodes.includes(response.code)) {
        console.log('✅ 获取学习时长分布成功，响应码:', response.code)
        const data = response.data || response || []
        
        // 处理数据格式，确保每个项目都有 name, value, itemStyle
        timeDistributionData.value = Array.isArray(data) ? data.map((item, index) => ({
          value: item.value || item.hours || 0,
          name: item.name || item.courseName || `课程${index + 1}`,
          itemStyle: {
            color: item.color || themeColors.chartColors[`series${(index % 4) + 1}`] || themeColors.chartColors.series1
          }
        })) : []
      } else {
        console.log('❌ 获取学习时长分布失败，错误码:', response.code, '错误信息:', response.message)
        // 使用默认数据作为fallback
        timeDistributionData.value = []
      }
    } else {
      // 非标准格式，直接使用响应数据
      console.log('📄 学习时长分布非标准格式响应，直接使用数据')
      const data = Array.isArray(response) ? response : []
      timeDistributionData.value = data.map((item, index) => ({
        value: item.value || item.hours || 0,
        name: item.name || item.courseName || `课程${index + 1}`,
        itemStyle: {
          color: item.color || themeColors.chartColors[`series${(index % 4) + 1}`] || themeColors.chartColors.series1
        }
      }))
    }
  } catch (error) {
    console.error('获取学习时长分布失败:', error)
    console.error('错误详情:', error.response?.data)
    
    // 如果API失败，使用空数组作为fallback（会显示默认数据）
    timeDistributionData.value = []
  }
}

// 获取作业列表数据
const fetchAssignments = async () => {
  try {
    console.log('📋 获取作业列表数据...')
    console.log('请求URL: http://192.168.1.157:8082/api/progress/assignments')
    
    const response = await userApi.getAssignments()
    console.log('📝 作业列表响应:', response)
    
    // 检查响应格式
    if (response && typeof response === 'object' && 'code' in response) {
      console.log('🏷️ 作业列表标准格式响应，code:', response.code, 'message:', response.message)
      
      const successCodes = [200, 0, 201, 204]
      if (successCodes.includes(response.code)) {
        console.log('✅ 获取作业列表成功，响应码:', response.code)
        const data = response.data || response || []
        
        // 处理数据格式，确保每个作业都有必要的字段
        homeworkList.value = Array.isArray(data) ? data.map((item, index) => ({
          id: item.id || index + 1,
          title: item.title || item.name || `作业${index + 1}`,
          courseName: item.courseName || item.course_name || '未知课程',
          enterprise: item.enterprise || item.company || '未知企业',
          deadline: item.deadline || item.due_date || '',
          submitted: item.submitted || false,
          score: item.score || item.grade || null,
          description: item.description || '',
          type: item.type || 'homework'
        })) : []
      } else {
        console.log('❌ 获取作业列表失败，错误码:', response.code, '错误信息:', response.message)
        // 使用默认数据作为fallback
        homeworkList.value = [
          {
            id: 1,
            title: 'Vue.js组件开发实践',
            courseName: 'Vue.js前端开发',
            enterprise: '李氏企业',
            deadline: '2024-01-20',
            submitted: false,
            score: null
          },
          {
            id: 2,
            title: 'Python数据分析项目',
            courseName: 'Python数据分析',
            enterprise: '王氏企业',
            deadline: '2024-01-22',
            submitted: true,
            score: 85
          },
          {
            id: 3,
            title: '数据库设计实验报告',
            courseName: '数据库系统原理',
            enterprise: '张氏企业',
            deadline: '2024-01-18',
            submitted: true,
            score: 92
          }
        ]
      }
    } else {
      // 非标准格式，直接使用响应数据
      console.log('📄 作业列表非标准格式响应，直接使用数据')
      const data = Array.isArray(response) ? response : []
      homeworkList.value = data.map((item, index) => ({
        id: item.id || index + 1,
        title: item.title || item.name || `作业${index + 1}`,
        courseName: item.courseName || item.course_name || '未知课程',
        enterprise: item.enterprise || item.company || '未知企业',
        deadline: item.deadline || item.due_date || '',
        submitted: item.submitted || false,
        score: item.score || item.grade || null,
        description: item.description || '',
        type: item.type || 'homework'
      }))
    }
  } catch (error) {
    console.error('获取作业列表失败:', error)
    console.error('错误详情:', error.response?.data)
    
    // 如果API失败，使用默认数据作为fallback
    homeworkList.value = [
      {
        id: 1,
        title: 'Vue.js组件开发实践',
        courseName: 'Vue.js前端开发',
        enterprise: '李氏企业',
        deadline: '2024-01-20',
        submitted: false,
        score: null
      },
      {
        id: 2,
        title: 'Python数据分析项目',
        courseName: 'Python数据分析',
        enterprise: '王氏企业',
        deadline: '2024-01-22',
        submitted: true,
        score: 85
      },
      {
        id: 3,
        title: '数据库设计实验报告',
        courseName: '数据库系统原理',
        enterprise: '张氏企业',
        deadline: '2024-01-18',
        submitted: true,
        score: 92
      }
    ]
  }
}

// 获取考试列表数据
const fetchExams = async () => {
  try {
    console.log('📝 获取考试列表数据...')
    console.log('请求URL: http://192.168.1.157:8082/api/progress/exams')
    
    const response = await userApi.getExams()
    console.log('📝 考试列表响应:', response)
    
    // 检查响应格式
    if (response && typeof response === 'object' && 'code' in response) {
      console.log('🏷️ 考试列表标准格式响应，code:', response.code, 'message:', response.message)
      
      const successCodes = [200, 0, 201, 204]
      if (successCodes.includes(response.code)) {
        console.log('✅ 获取考试列表成功，响应码:', response.code)
        const data = response.data || response || []
        
        // 处理数据格式，确保每个考试都有必要的字段
        examList.value = Array.isArray(data) ? data.map((item, index) => ({
          id: item.id || index + 1,
          title: item.title || item.name || `考试${index + 1}`,
          courseName: item.courseName || item.course_name || '未知课程',
          date: item.date || item.exam_date || '',
          time: item.time || item.exam_time || '',
          location: item.location || item.exam_location || '待定',
          duration: item.duration || item.exam_duration || 120,
          description: item.description || '',
          type: item.type || 'exam'
        })) : []
      } else {
        console.log('❌ 获取考试列表失败，错误码:', response.code, '错误信息:', response.message)
        // 使用默认数据作为fallback
        examList.value = [
          {
            id: 1,
            title: 'Python数据分析期末考试',
            courseName: 'Python数据分析',
            date: '2024-01-25',
            time: '14:00-16:00',
            location: '教学楼A101',
            duration: 120
          },
          {
            id: 2,
            title: '数据结构与算法期中考试',
            courseName: '数据结构与算法',
            date: '2024-02-01',
            time: '09:00-11:00',
            location: '教学楼B201',
            duration: 120
          }
        ]
      }
    } else {
      // 非标准格式，直接使用响应数据
      console.log('📄 考试列表非标准格式响应，直接使用数据')
      const data = Array.isArray(response) ? response : []
      examList.value = data.map((item, index) => ({
        id: item.id || index + 1,
        title: item.title || item.name || `考试${index + 1}`,
        courseName: item.courseName || item.course_name || '未知课程',
        date: item.date || item.exam_date || '',
        time: item.time || item.exam_time || '',
        location: item.location || item.exam_location || '待定',
        duration: item.duration || item.exam_duration || 120,
        description: item.description || '',
        type: item.type || 'exam'
      }))
    }
  } catch (error) {
    console.error('获取考试列表失败:', error)
    console.error('错误详情:', error.response?.data)
    
    // 如果API失败，使用默认数据作为fallback
    examList.value = [
      {
        id: 1,
        title: 'Python数据分析期末考试',
        courseName: 'Python数据分析',
        date: '2024-01-25',
        time: '14:00-16:00',
        location: '教学楼A101',
        duration: 120
      },
      {
        id: 2,
        title: '数据结构与算法期中考试',
        courseName: '数据结构与算法',
        date: '2024-02-01',
        time: '09:00-11:00',
        location: '教学楼B201',
        duration: 120
      }
    ]
  }
}

// 页面加载时获取数据
onMounted(async () => {
  await Promise.all([
    fetchProgressStats(),
    fetchProgressCourses(),
    fetchCreditsTrend(),
    fetchTimeDistribution(),
    fetchAssignments(),
    fetchExams()
  ])
})
</script>

<style lang="scss" scoped>
@import '@/styles/main.scss';

.progress-container {
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

  .stats-row {
    margin-bottom: 20px;

    .stat-card {
      border: none;

      .stat-content {
        display: flex;
        align-items: center;
        gap: 16px;

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-info {
          flex: 1;

          .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: $text-primary;
            margin-bottom: 4px;
          }

          .stat-label {
            font-size: 14px;
            color: $text-secondary;
          }
        }
      }
    }
  }

  .filter-card {
    margin-bottom: 20px;
    border: none;

    .filter-form {
      margin: 0;
    }
  }

  .courses-card {
    margin-bottom: 20px;
    border: none;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    }

    .courses-list {
      .course-item {
        margin-bottom: 16px;
        border: none;
        transition: all 0.3s;

        &:hover {
          transform: translateY(-2px);
        }

        .course-main {
          display: flex;
          gap: 24px;
          align-items: center;

          .course-info {
            flex: 1;

            .course-header-info {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 12px;

              .course-name {
                font-size: 18px;
                font-weight: 600;
                margin: 0;
                color: $text-primary;
              }
            }

            .course-meta {
              display: flex;
              gap: 20px;
              flex-wrap: wrap;

              .meta-item {
                display: flex;
                align-items: center;
                gap: 4px;
                font-size: 14px;
                color: $text-regular;

                .el-icon {
                  color: $text-secondary;
                }
              }
            }
          }

          .course-progress-section {
            width: 300px;

            .progress-header {
              display: flex;
              justify-content: space-between;
              font-size: 14px;
              color: $text-regular;
              margin-bottom: 8px;

              .progress-percent {
                font-weight: 600;
                color: $text-primary;
              }
            }

            .progress-details {
              display: flex;
              flex-direction: column;
              gap: 4px;
              margin-top: 8px;
              font-size: 12px;
              color: $text-secondary;
            }
          }

          .course-actions {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
        }
      }
    }
  }

  .charts-row {
    margin-bottom: 20px;
  }

  .chart-card {
    border: none;
    margin-bottom: 20px;
  }

  .assignments-card {
    border: none;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      :deep(.el-tabs) {
        .el-tabs__header {
          margin: 0;
        }
      }
    }

    .assignment-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      margin-bottom: 12px;
      background: $bg-color;
      border-radius: 8px;
      transition: all 0.3s;

      &:hover {
        background: darken($bg-color, 2%);
        transform: translateX(4px);
      }

      .assignment-info {
        flex: 1;

        .assignment-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;

          .assignment-title {
            font-size: 16px;
            font-weight: 600;
            margin: 0;
            color: $text-primary;
          }
        }

        .assignment-desc {
          font-size: 14px;
          color: $text-regular;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 4px;

          .el-icon {
            color: $text-secondary;
          }
        }

        .assignment-meta {
          font-size: 13px;
          color: $text-secondary;

          .score {
            color: $success-color;
            font-weight: 600;
          }

          .score-placeholder {
            color: $text-placeholder;
          }
        }
      }

      .assignment-actions {
        display: flex;
        gap: 8px;
        margin-left: 16px;
      }
    }
  }
}

@media (max-width: 768px) {
  .progress-container {
    .courses-card {
      .courses-list {
        .course-item {
          .course-main {
            flex-direction: column;
            align-items: flex-start;

            .course-progress-section {
              width: 100%;
            }

            .course-actions {
              width: 100%;
              flex-direction: row;
            }
          }
        }
      }
    }
  }
}

// 作业提交对话框样式
:deep(.submit-dialog-content) {
  .assignment-info-summary {
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;
    margin-bottom: 20px;

    h4 {
      margin: 0 0 8px 0;
      font-size: 16px;
      font-weight: 600;
      color: $text-primary;
    }

    .course-info {
      margin: 0;
      font-size: 14px;
      color: $text-regular;
    }
  }
}

:deep(.dialog-footer) {
  text-align: right;
}

// 课程详情对话框样式
:deep(.course-detail-content) {
  .course-detail-info {
    .course-basic-info {
      margin-bottom: 24px;

      .course-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;

        .course-title {
          margin: 0;
          font-size: 24px;
          font-weight: 700;
          color: $text-primary;
        }
      }

      .course-meta-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;

        .meta-item {
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;

          .meta-label {
            font-size: 13px;
            color: $text-secondary;
            margin-bottom: 4px;
          }

          .meta-value {
            font-size: 15px;
            color: $text-primary;
            font-weight: 500;
          }
        }
      }
    }

    .course-progress-info {
      margin-bottom: 24px;

      h3 {
        margin: 0 0 16px 0;
        font-size: 18px;
        color: $text-primary;
      }

      .progress-stats {
        .progress-item {
          margin-bottom: 16px;

          .progress-label {
            font-size: 14px;
            color: $text-regular;
            margin-bottom: 8px;
          }

          .progress-text {
            font-size: 16px;
            color: $text-primary;
            font-weight: 600;
            margin-top: 8px;
          }
        }

        .time-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;

          .time-item {
            padding: 12px;
            background: #f8f9fa;
            border-radius: 8px;

            .time-label {
              font-size: 13px;
              color: $text-secondary;
              margin-bottom: 4px;
            }

            .time-value {
              font-size: 15px;
              color: $text-primary;
              font-weight: 500;
            }
          }
        }
      }
    }

    .course-description {
      margin-bottom: 24px;

      h3 {
        margin: 0 0 12px 0;
        font-size: 18px;
        color: $text-primary;
      }

      p {
        margin: 0;
        font-size: 14px;
        color: $text-regular;
        line-height: 1.6;
      }
    }

    .course-syllabus {
      margin-bottom: 24px;

      h3 {
        margin: 0 0 16px 0;
        font-size: 18px;
        color: $text-primary;
      }

      :deep(.el-timeline) {
        .el-timeline-item__content {
          .el-card {
            h4 {
              margin: 0 0 8px 0;
              font-size: 16px;
              color: $text-primary;
            }

            p {
              margin: 0;
              font-size: 14px;
              color: $text-regular;
            }
          }
        }
      }
    }

    .course-tags {
      h3 {
        margin: 0 0 12px 0;
        font-size: 18px;
        color: $text-primary;
      }

      .tags-container {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .tag-item {
          margin: 0;
        }
      }
    }
  }
}
</style>
