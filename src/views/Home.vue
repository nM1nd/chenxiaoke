<template>
  <div class="home-container">
    <!-- 欢迎横幅 -->
    <div class="welcome-banner">
      <div class="banner-content">
        <div class="welcome-text">
          <h1 class="greeting">
            你好，{{ userInfo.name }} 👋
            <el-tag :type="hasCompletedCourse ? 'success' : 'info'" size="large" class="certification-tag">
              {{ hasCompletedCourse ? '学分认证' : '无学分认证' }}
            </el-tag>
          </h1>
          <p class="subtitle">欢迎回到EduNexus一学分课堂</p>
        </div>
        <div class="banner-stats">
          <div class="stat-card">
            <div class="stat-value">{{ stats.totalCourses }}</div>
            <div class="stat-label">已选课程</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ stats.completionRate }}%</div>
            <div class="stat-label">完成进度</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <h2 class="section-title">
        <el-icon><Lightning /></el-icon>
        快速操作
      </h2>
      <div class="action-grid">
        <el-card
          v-for="action in quickActions"
          :key="action.path"
          class="action-card"
          shadow="hover"
          @click="handleAction(action.path)"
        >
          <div class="action-content">
            <div class="action-icon" :style="{ background: action.color }">
              <el-icon :size="28">
                <component :is="action.icon" />
              </el-icon>
            </div>
            <div class="action-info">
              <h3>{{ action.title }}</h3>
              <p>{{ action.desc }}</p>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 主要内容区域 - 左右分栏 -->
    <el-row :gutter="20" class="main-content-row">
      <!-- 左侧内容 -->
      <el-col :xs="24" :lg="16">
        <!-- 学习统计图表 -->
        <el-card class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>学习统计</span>
              <el-radio-group v-model="chartTimeRange" size="small">
                <el-radio-button label="week">本周</el-radio-button>
                <el-radio-button label="month">本月</el-radio-button>
              </el-radio-group>
            </div>
          </template>
          <v-chart :option="studyChartOption" style="height: 300px" />
        </el-card>

        <!-- 学生技能展示 -->
        <el-card class="skills-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>我的技能</span>
            </div>
          </template>
          <v-chart :option="skillsChartOption" style="height: 300px" />
        </el-card>

        <!-- 最近课程 -->
        <div class="recent-courses">
          <div class="section-header">
            <h2 class="section-title">
              <el-icon><Clock /></el-icon>
              最近学习的课程
            </h2>
            <el-button type="primary" text @click="$router.push('/progress')">
              查看全部
              <el-icon><ArrowRight /></el-icon>
            </el-button>
          </div>
      <el-row :gutter="20">
        <el-col
          v-for="course in recentCourses"
          :key="course.id"
          :xs="24"
          :sm="12"
          :md="8"
        >
          <el-card class="course-card" shadow="hover">
            <div class="course-header">
              <el-tag :type="course.status === '进行中' ? 'success' : 'info'">
                {{ course.status }}
              </el-tag>
              <span class="course-credits">{{ course.credits }}学分</span>
            </div>
            <h3 class="course-title">{{ course.name }}</h3>
            <p class="course-enterprise">课程来源：{{ course.enterprise }}</p>
            <div class="course-progress">
              <div class="progress-info">
                <span>学习进度</span>
                <span>{{ course.progress }}%</span>
              </div>
              <el-progress
                :percentage="course.progress"
                :color="getProgressColor(course.progress)"
                :stroke-width="8"
              />
            </div>
            <div class="course-footer">
              <el-button type="primary" size="small" text>
                继续学习
                <el-icon><ArrowRight /></el-icon>
              </el-button>
            </div>
          </el-card>
        </el-col>
      </el-row>
        </div>
      </el-col>

      <!-- 右侧内容 -->
      <el-col :xs="24" :lg="8">
        <!-- 学习日历 -->
        <el-card class="calendar-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>学习日历</span>
              <el-button type="text" size="small">查看详情</el-button>
            </div>
          </template>
          <el-calendar v-model="calendarDate">
            <template #date-cell="{ data }">
              <div class="calendar-cell">
                <div class="date-number">{{ data.day.split('-').slice(2).join('-') }}</div>
                <div v-if="hasEvent(data.day)" class="event-dot"></div>
              </div>
            </template>
          </el-calendar>
          <div class="calendar-events">
            <div v-for="event in todayEventsList" :key="event.id" class="event-item">
              <el-tag :type="event.type" size="small">{{ event.type === 'warning' ? '作业' : '考试' }}</el-tag>
              <span class="event-title">{{ event.title }}</span>
            </div>
          </div>
        </el-card>

        <!-- 待办事项 -->
        <el-card class="todo-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>待办事项</span>
              <el-badge :value="todoList.filter(t => !t.completed).length" class="todo-badge">
                <el-button type="text" size="small" @click="showTodoDialog = true">管理</el-button>
              </el-badge>
            </div>
          </template>
          <div class="todo-list">
            <el-skeleton v-if="todosLoading" :rows="3" animated />
            <template v-else>
            <div
              v-for="todo in todoList.slice(0, 5)"
              :key="todo.id"
              class="todo-item"
              :class="{ completed: todo.completed }"
            >
              <el-checkbox v-model="todo.completed" @change="handleTodoChange(todo)">
                <div class="todo-content">
                  <span class="todo-text">{{ todo.title }}</span>
                  <div class="todo-meta">
                    <el-tag v-if="todo.priority" :type="getPriorityType(todo.priority)" size="small" style="margin-right: 8px">
                      {{ getPriorityText(todo.priority) }}
                    </el-tag>
                    <el-tag v-if="todo.deadline" :type="getDeadlineType(todo.deadline)" size="small">
                      {{ formatDeadline(todo.deadline) }}
                    </el-tag>
                  </div>
                </div>
              </el-checkbox>
            </div>
              <el-empty v-if="todoList.length === 0" description="暂无待办事项" :image-size="80" />
            </template>
          </div>
        </el-card>

        <!-- 通知公告 -->
        <el-card class="notice-card" shadow="never">
          <template #header>
            <span>通知公告</span>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="notice in notices.slice(0, 3)"
              :key="notice.id"
              :timestamp="notice.time"
              placement="top"
              size="small"
            >
              <div class="notice-item">
                <h4>{{ notice.title }}</h4>
                <p>{{ notice.content }}</p>
              </div>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>

    <!-- 待办事项对话框 -->
    <el-dialog v-model="showTodoDialog" title="待办事项管理" width="600px">
      <div class="todo-dialog-content">
        <el-input
          v-model="newTodoTitle"
          placeholder="待办事项标题"
          class="todo-input"
          style="margin-bottom: 10px"
        />
        
        <el-input
          v-model="newTodoDescription"
          type="textarea"
          :rows="3"
          placeholder="待办事项描述（可选）"
          style="margin-bottom: 10px"
        />
        
        <div style="display: flex; gap: 10px; margin-bottom: 15px;">
          <el-date-picker
            v-model="newTodoDeadline"
            type="date"
            placeholder="截止日期（可选）"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="flex: 1"
          />
          
          <el-select
            v-model="newTodoPriority"
            placeholder="优先级"
            style="width: 120px"
          >
            <el-option label="低" :value="1" />
            <el-option label="中" :value="2" />
            <el-option label="高" :value="3" />
          </el-select>
        </div>
        
        <el-button type="primary" @click="addTodo" style="width: 100%">
          添加待办事项
        </el-button>
        <div class="todo-list-full">
          <el-skeleton v-if="todosLoading" :rows="5" animated />
          <template v-else>
            <div
              v-for="todo in todoList"
              :key="todo.id"
              class="todo-item-full"
              :class="{ completed: todo.completed }"
            >
            <el-checkbox v-model="todo.completed">
              <div class="todo-content">
                <div class="todo-main">
                  <span class="todo-text">{{ todo.title }}</span>
                  <p v-if="todo.description" class="todo-description">{{ todo.description }}</p>
                </div>
                <div class="todo-meta">
                  <el-tag v-if="todo.priority" :type="getPriorityType(todo.priority)" size="small" style="margin-right: 8px">
                    {{ getPriorityText(todo.priority) }}
                  </el-tag>
                  <el-tag v-if="todo.deadline" :type="getDeadlineType(todo.deadline)" size="small">
                    {{ formatDeadline(todo.deadline) }}
                  </el-tag>
                </div>
              </div>
            </el-checkbox>
            <el-date-picker
              v-model="todo.deadline"
              type="date"
              placeholder="设置截止日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              size="small"
              style="width: 150px; margin-left: 10px"
            />
            <el-button
              type="danger"
              text
              size="small"
              @click="removeTodo(todo.id)"
              style="margin-left: 10px"
            >
              删除
            </el-button>
          </div>
        </template>
        </div>
      </div>
      <template #footer>
        <el-button @click="showTodoDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Lightning,
  Clock,
  ArrowRight,
  Bell,
  Document,
  DataAnalysis,
  Briefcase
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { themeColors } from '@/styles/variables.js'
import { userApi, courseApi } from '@/api'

const router = useRouter()

// 替换现有的硬编码数据为动态获取
const userInfo = ref({})
const recentCourses = ref([])
const stats = ref({})

// 页面加载时获取数据
onMounted(async () => {
  await Promise.all([
    fetchUserInfo(),
    fetchRecentCourses(),
    fetchStats(),
    fetchStudyChart(),
    fetchTodos(),
    fetchSkillsData(),
    fetchCalendarEvents(),
    fetchTodayEvents(),
    fetchNotices()
  ])
})

// 获取用户信息
const fetchUserInfo = async () => {
  console.log('开始获取用户信息...')
  
  try {
    // 首先尝试从localStorage获取用户信息
    const savedUserInfo = localStorage.getItem('userInfo')
    const username = localStorage.getItem('username')
    
    console.log('localStorage中的userInfo:', savedUserInfo)
    console.log('localStorage中的username:', username)
    
    if (savedUserInfo) {
      userInfo.value = JSON.parse(savedUserInfo)
      console.log('使用localStorage中的userInfo:', userInfo.value)
    } else if (username) {
      userInfo.value = { name: username }
      console.log('使用username创建userInfo:', userInfo.value)
    }
    
    // 尝试从API获取最新用户信息
    try {
      const data = await userApi.getUserInfo()
      console.log('API返回的用户信息:', data)
      userInfo.value = data
      // 更新localStorage中的用户信息
      localStorage.setItem('userInfo', JSON.stringify(data))
    } catch (apiError) {
      console.log('API获取用户信息失败，使用本地数据:', apiError)
      // 如果上面已经设置了userInfo，这里不需要做任何事
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    // 最后的fallback
    userInfo.value = { name: '同学' }
    console.log('使用fallback userInfo:', userInfo.value)
  }
}

// 获取最近课程
const fetchRecentCourses = async () => {
  try {
    console.log('📚 获取最近学习的课程...')
    console.log('请求URL: http://192.168.1.132:8082/api/home/recent-courses')
    
    const response = await userApi.getRecentCourses()
    console.log('📝 最近课程响应:', response)
    
    // 检查响应格式
    if (response && typeof response === 'object' && 'code' in response) {
      console.log('🏷️ 最近课程标准格式响应，code:', response.code, 'message:', response.message)
      
      const successCodes = [200, 0, 201, 204]
      if (successCodes.includes(response.code)) {
        console.log('✅ 获取最近课程成功，响应码:', response.code)
        recentCourses.value = response.data || response || []
      } else {
        console.log('❌ 获取最近课程失败，错误码:', response.code, '错误信息:', response.message)
        // 使用默认课程数据作为fallback
        recentCourses.value = [
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
        ]
      }
    } else {
      // 非标准格式，直接使用响应数据
      console.log('📄 最近课程非标准格式响应，直接使用数据')
      recentCourses.value = Array.isArray(response) ? response : []
    }
  } catch (error) {
    console.error('获取最近课程失败:', error)
    console.error('错误详情:', error.response?.data)
    
    // 如果API失败，使用默认课程数据作为fallback
    recentCourses.value = [
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
    ]
  }
}

// 获取统计数据
const fetchStats = async () => {
  try {
    console.log('📊 获取首页统计数据...')
    console.log('请求URL: http://192.168.1.132:8082/api/home/stats')
    
    const response = await userApi.getHomeStats()
    console.log('📝 首页统计响应:', response)
    
    // 检查响应格式
    let statsData = {}
    if (response && typeof response === 'object' && 'data' in response) {
      // 如果响应有data字段
      statsData = response.data
    } else if (response && typeof response === 'object') {
      // 直接使用响应数据
      statsData = response
    }
    
    // 确保基本字段存在
    stats.value = {
      totalCourses: statsData.totalCourses || 0,
      completionRate: statsData.completionRate || 0,
      completedCourses: statsData.completedCourses || 0,
      ongoingCourses: statsData.ongoingCourses || 0,
      ...statsData // 保留其他字段
    }
    
    console.log('✅ 首页统计数据加载成功:', stats.value)
  } catch (error) {
    console.error('❌ 获取首页统计数据失败:', error)
    console.error('错误详情:', error.response?.data)
    
    // 如果API失败，使用默认值作为fallback
    stats.value = {
      totalCourses: 8,
      completionRate: 75,
      completedCourses: 6,
      ongoingCourses: 2
    }
  }
}

// 获取学习图表数据
const fetchStudyChart = async () => {
  try {
    console.log('📈 获取学习图表数据...')
    console.log('请求URL: http://192.168.1.132:8082/api/home/study-chart')
    
    const response = await userApi.getStudyChartData()
    console.log('📝 学习图表响应:', response)
    
    // 检查响应格式
    let chartData = {}
    if (response && typeof response === 'object' && 'data' in response) {
      // 如果响应有data字段
      chartData = response.data
    } else if (response && typeof response === 'object') {
      // 直接使用响应数据
      chartData = response
    }
    
    // 确保基本结构存在
    studyHoursData.value = {
      week: {
        days: chartData.week?.days || ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        hours: chartData.week?.hours || [2.5, 3.0, 2.0, 3.5, 2.5, 1.5, 1.0]
      },
      month: {
        days: chartData.month?.days || ['第1周', '第2周', '第3周', '第4周'],
        hours: chartData.month?.hours || [15, 18, 16, 14]
      },
      ...chartData // 保留其他字段
    }
    
    console.log('✅ 学习图表数据加载成功:', studyHoursData.value)
  } catch (error) {
    console.error('❌ 获取学习图表数据失败:', error)
    console.error('错误详情:', error.response?.data)
    
    // 如果API失败，使用默认值作为fallback
    studyHoursData.value = {
      week: {
        days: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        hours: [2.5, 3.0, 2.0, 3.5, 2.5, 1.5, 1.0]
      },
      month: {
        days: ['第1周', '第2周', '第3周', '第4周'],
        hours: [15, 18, 16, 14]
      }
    }
  }
}

const fetchTodos = async () => {
  try {
    todosLoading.value = true
    console.log('📋 开始获取待办事项列表')
    console.log('请求URL:', 'http://192.168.1.132:8082/api/home/todos')
    
    const response = await userApi.getTodos()
    console.log('📝 获取待办事项响应:', response)
    
    // 检查响应格式
    if (response && typeof response === 'object' && 'code' in response) {
      console.log('🏷️ 待办事项标准格式响应，code:', response.code, 'message:', response.message)
      
      const successCodes = [200, 0, 201, 204]
      if (successCodes.includes(response.code)) {
        console.log('✅ 获取待办事项成功，响应码:', response.code)
        todoList.value = response.data || response || []
        // 更新ID计数器
        if (todoList.value.length > 0) {
          const maxId = Math.max(...todoList.value.map(todo => todo.id || 0))
          todoIdCounter.value = maxId + 1
        }
      } else {
        console.log('❌ 获取待办事项失败，错误码:', response.code, '错误信息:', response.message)
        // 使用空数组作为fallback
        todoList.value = []
      }
    } else {
      // 非标准格式，直接使用响应数据
      console.log('📄 获取待办事项非标准格式响应，直接使用数据')
      todoList.value = Array.isArray(response) ? response : []
    }
  } catch (error) {
    console.error('获取待办事项失败:', error)
    console.error('错误详情:', error.response?.data)
    
    // 如果API失败，使用一些示例数据作为fallback
    todoList.value = [
      {
        id: 1,
        title: '完成Vue.js前端开发作业',
        completed: false,
        deadline: '2024-01-20'
      },
      {
        id: 2,
        title: '准备Python数据分析考试',
        completed: false,
        deadline: '2024-01-25'
      }
    ]
  } finally {
    todosLoading.value = false
  }
}

// 获取学生技能数据
const fetchSkillsData = async () => {
  try {
    console.log('🎯 获取学生技能数据...')
    console.log('请求URL: http://192.168.1.132:8082/api/home/skills')
    
    const response = await userApi.getSkillsData()
    console.log('📝 技能数据响应:', response)
    
    // 检查响应格式
    if (response && typeof response === 'object' && 'code' in response) {
      console.log('🏷️ 技能数据标准格式响应，code:', response.code, 'message:', response.message)
      
      const successCodes = [200, 0, 201, 204]
      if (successCodes.includes(response.code)) {
        console.log('✅ 获取技能数据成功，响应码:', response.code)
        skillsData.value = response.data || response || []
      } else {
        console.log('❌ 获取技能数据失败，错误码:', response.code, '错误信息:', response.message)
        // 使用默认技能数据作为fallback
        skillsData.value = [
          { name: 'Vue.js前端开发', value: 35 },
          { name: 'React高级开发', value: 25 },
          { name: 'Python数据分析', value: 20 },
          { name: '数据库系统', value: 12 },
          { name: 'Node.js后端', value: 8 }
        ]
      }
    } else {
      // 非标准格式，直接使用响应数据
      console.log('📄 技能数据非标准格式响应，直接使用数据')
      skillsData.value = Array.isArray(response) ? response : []
    }
  } catch (error) {
    console.error('获取技能数据失败:', error)
    console.error('错误详情:', error.response?.data)
    
    // 如果API失败，使用默认技能数据作为fallback
    skillsData.value = [
      { name: 'Vue.js前端开发', value: 35 },
      { name: 'React高级开发', value: 25 },
      { name: 'Python数据分析', value: 20 },
      { name: '数据库系统', value: 12 },
      { name: 'Node.js后端', value: 8 }
    ]
  }
}

// 获取学习日历事件
const fetchCalendarEvents = async () => {
  try {
    console.log('📅 获取学习日历事件...')
    console.log('请求URL: http://192.168.1.132:8082/api/home/calendar-events')
    
    const response = await userApi.getCalendarEvents()
    console.log('📝 日历事件响应:', response)
    
    // 检查响应格式
    if (response && typeof response === 'object' && 'code' in response) {
      console.log('🏷️ 日历事件标准格式响应，code:', response.code, 'message:', response.message)
      
      const successCodes = [200, 0, 201, 204]
      if (successCodes.includes(response.code)) {
        console.log('✅ 获取日历事件成功，响应码:', response.code)
        calendarEvents.value = response.data || response || []
      } else {
        console.log('❌ 获取日历事件失败，错误码:', response.code, '错误信息:', response.message)
        // 使用默认日历事件作为fallback
        calendarEvents.value = [
          { date: '2024-01-20', title: 'Vue.js作业截止', type: 'warning' },
          { date: '2024-01-22', title: '数据结构复习', type: 'info' },
          { date: '2024-01-25', title: 'Python数据分析考试', type: 'danger' }
        ]
      }
    } else {
      // 非标准格式，直接使用响应数据
      console.log('📄 日历事件非标准格式响应，直接使用数据')
      calendarEvents.value = Array.isArray(response) ? response : []
    }
  } catch (error) {
    console.error('获取日历事件失败:', error)
    console.error('错误详情:', error.response?.data)
    
    // 如果API失败，使用默认日历事件作为fallback
    calendarEvents.value = [
      { date: '2024-01-20', title: 'Vue.js作业截止', type: 'warning' },
      { date: '2024-01-22', title: '数据结构复习', type: 'info' },
      { date: '2024-01-25', title: 'Python数据分析考试', type: 'danger' }
    ]
  }
}

// 获取今日事件列表
const fetchTodayEvents = async () => {
  try {
    console.log('📅 获取今日事件列表...')
    console.log('请求URL: http://192.168.1.132:8082/api/home/today-events')
    
    const response = await userApi.getTodayEvents()
    console.log('📝 今日事件响应:', response)
    
    // 检查响应格式
    if (response && typeof response === 'object' && 'code' in response) {
      console.log('🏷️ 今日事件标准格式响应，code:', response.code, 'message:', response.message)
      
      const successCodes = [200, 0, 201, 204]
      if (successCodes.includes(response.code)) {
        console.log('✅ 获取今日事件成功，响应码:', response.code)
        todayEventsList.value = response.data || response || []
      } else {
        console.log('❌ 获取今日事件失败，错误码:', response.code, '错误信息:', response.message)
        // 使用空数组作为fallback
        todayEventsList.value = []
      }
    } else {
      // 非标准格式，直接使用响应数据
      console.log('📄 今日事件非标准格式响应，直接使用数据')
      todayEventsList.value = Array.isArray(response) ? response : []
    }
  } catch (error) {
    console.error('获取今日事件失败:', error)
    console.error('错误详情:', error.response?.data)
    
    // 如果API失败，使用空数组作为fallback
    todayEventsList.value = []
  }
}

// 获取通知公告列表
const fetchNotices = async () => {
  try {
    console.log('📢 获取通知公告列表...')
    console.log('请求URL: http://192.168.1.132:8082/api/home/notices')
    
    const response = await userApi.getNotices()
    console.log('📝 通知公告响应:', response)
    
    // 检查响应格式
    if (response && typeof response === 'object' && 'code' in response) {
      console.log('🏷️ 通知公告标准格式响应，code:', response.code, 'message:', response.message)
      
      const successCodes = [200, 0, 201, 204]
      if (successCodes.includes(response.code)) {
        console.log('✅ 获取通知公告成功，响应码:', response.code)
        notices.value = response.data || response || []
      } else {
        console.log('❌ 获取通知公告失败，错误码:', response.code, '错误信息:', response.message)
        // 使用默认通知公告作为fallback
        notices.value = [
          {
            id: 1,
            title: '选课通知',
            content: '2024春季学期选课即将开始，请同学们及时关注选课时间。',
            time: '2024-01-15 10:00'
          },
          {
            id: 2,
            title: '项目实训报名',
            content: '企业项目实训报名通道已开启，有意向的同学请尽快报名。',
            time: '2024-01-14 14:30'
          },
          {
            id: 3,
            title: '学习进度提醒',
            content: '部分课程学习进度较低，请合理安排学习时间。',
            time: '2024-01-13 09:00'
          }
        ]
      }
    } else {
      // 非标准格式，直接使用响应数据
      console.log('📄 通知公告非标准格式响应，直接使用数据')
      notices.value = Array.isArray(response) ? response : []
    }
  } catch (error) {
    console.error('获取通知公告失败:', error)
    console.error('错误详情:', error.response?.data)
    
    // 如果API失败，使用默认通知公告作为fallback
    notices.value = [
      {
        id: 1,
        title: '选课通知',
        content: '2024春季学期选课即将开始，请同学们及时关注选课时间。',
        time: '2024-01-15 10:00'
      },
      {
        id: 2,
        title: '项目实训报名',
        content: '企业项目实训报名通道已开启，有意向的同学请尽快报名。',
        time: '2024-01-14 14:30'
      },
      {
        id: 3,
        title: '学习进度提醒',
        content: '部分课程学习进度较低，请合理安排学习时间。',
        time: '2024-01-13 09:00'
      }
    ]
  }
}

// 判断是否有完成的课程
const hasCompletedCourse = computed(() => {
  return recentCourses.value.some(course => course.status === '已完成')
})

const chartTimeRange = ref('week')
const calendarDate = ref(new Date())
const showTodoDialog = ref(false)
const newTodoTitle = ref('')

const quickActions = ref([
  {
    title: '选课',
    desc: '选择新课程',
    icon: 'Document',
    path: '/course-selection',
    color: themeColors.gradientPrimary
  },
  {
    title: '学习进度',
    desc: '查看学习进度',
    icon: 'DataAnalysis',
    path: '/progress',
    color: themeColors.gradientPink
  },
  {
    title: '项目实训',
    desc: '选择项目实训',
    icon: 'Briefcase',
    path: '/project-training',
    color: themeColors.gradientBlue
  }
])



const notices = ref([])

const todoList = ref([])
const todoIdCounter = ref(1)
const todosLoading = ref(false)

// 添加待办事项的表单数据
const newTodoDescription = ref('')
const newTodoDeadline = ref('')
const newTodoPriority = ref(1)

const calendarEvents = ref([])
const todayEventsList = ref([])

const studyHoursData = ref({
  week: {
    days: [],
    hours: []
  },
  month: {
    days: [],
    hours: []
  }
})

// 学生技能数据
const skillsData = ref([])

// 技能图表配置
const skillsChartOption = computed(() => {
  // 使用 ECharts 支持的渐变颜色配置
  const colors = [
    {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: '#76afff' },
        { offset: 1, color: '#4facfe' }
      ]
    },
    {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: '#de97ff' },
        { offset: 1, color: '#f093fb' }
      ]
    },
    {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: '#4facfe' },
        { offset: 1, color: '#00f2fe' }
      ]
    },
    {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: '#43e97b' },
        { offset: 1, color: '#38f9d7' }
      ]
    },
    {
      type: 'linear',
      x: 0,
      y: 0,
      x2: 0,
      y2: 1,
      colorStops: [
        { offset: 0, color: '#f093fb' },
        { offset: 1, color: '#f5576c' }
      ]
    }
  ]
  
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      textStyle: {
        fontSize: 12,
        color: themeColors.textRegular
      },
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 8
    },
    series: [
      {
        name: '技能分布',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            color: themeColors.textPrimary
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        labelLine: {
          show: false
        },
        data: skillsData.value.map((item, index) => ({
          ...item,
          itemStyle: {
            color: colors[index % colors.length]
          }
        }))
      }
    ]
  }
})

const handleAction = (path) => {
  router.push(path)
}

const getProgressColor = (percentage) => {
  if (percentage < 50) return themeColors.dangerColor
  if (percentage < 80) return themeColors.warningColor
  return themeColors.successColor
}

// 学习统计图表配置
const studyChartOption = computed(() => {
  const data = chartTimeRange.value === 'week' ? studyHoursData.value.week : studyHoursData.value.month
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
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
      data: data.days,
      axisLine: {
        lineStyle: {
          color: themeColors.chartColors.axisLine
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '学习时长(小时)',
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
        name: '学习时长',
        type: 'bar',
        data: data.hours,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: themeColors.chartColors.gradientStart },
              { offset: 1, color: themeColors.chartColors.gradientEnd }
            ]
          },
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: themeColors.chartColors.shadowColor
          }
        }
      }
    ]
  }
})

// 日历相关方法
const hasEvent = (date) => {
  return calendarEvents.value.some(event => event.date === date)
}



// 待办事项相关方法
const addTodo = async () => {
  if (!newTodoTitle.value.trim()) return
  
  try {
    console.log('➕ 添加待办事项:', newTodoTitle.value)
    console.log('请求URL:', 'http://192.168.1.132:8082/api/home/todos')
    
    const newTodo = {
      title: newTodoTitle.value,
      description: newTodoDescription.value,
      deadline: newTodoDeadline.value || null,
      priority: newTodoPriority.value
    }
    
    // 验证日期格式
    if (newTodo.deadline) {
      const date = new Date(newTodo.deadline)
      if (isNaN(date.getTime())) {
        console.warn('⚠️ 无效的日期格式:', newTodo.deadline)
        ElMessage.error('请选择有效的日期')
        return
      }
    }
    
    console.log('📋 完整待办事项数据:', newTodo)
    
    const response = await userApi.addTodo(newTodo)
    console.log('📝 添加待办事项响应:', response)
    
    // 检查响应格式
    if (response && typeof response === 'object' && 'code' in response) {
      console.log('🏷️ 添加待办事项标准格式响应，code:', response.code, 'message:', response.message)
      
      const successCodes = [200, 0, 201, 204]
      if (successCodes.includes(response.code)) {
        console.log('✅ 添加待办事项成功，响应码:', response.code)
        // 使用API返回的数据或创建本地数据
        const addedTodo = response.data || {
          id: todoIdCounter.value++,
          ...newTodo
        }
        todoList.value.push(addedTodo)
        // 清空表单
        newTodoTitle.value = ''
        newTodoDescription.value = ''
        newTodoDeadline.value = ''
        newTodoPriority.value = 1
      } else {
        console.log('❌ 添加待办事项失败，错误码:', response.code, '错误信息:', response.message)
        const errorMsg = response.message && response.message.trim() !== '' ? response.message : '添加失败'
        ElMessage.error(errorMsg)
      }
    } else {
      // 非标准格式，直接添加到本地列表
      console.log('📄 添加待办事项非标准格式响应，直接添加到本地')
      todoList.value.push({
        id: todoIdCounter.value++,
        ...newTodo
      })
      newTodoTitle.value = ''
    }
  } catch (error) {
    console.error('添加待办事项失败:', error)
    console.error('错误详情:', error.response?.data)
    
    let errorMessage = '添加失败，请稍后重试'
    if (error.response?.status === 400) {
      errorMessage = '待办事项内容不能为空'
    } else if (error.response?.status === 500) {
      errorMessage = '服务器内部错误，请稍后重试'
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    ElMessage.error(errorMessage)
  }
}

const removeTodo = async (id) => {
  try {
    console.log('🗑️ 删除待办事项，ID:', id)
    console.log('请求URL:', `http://192.168.1.132:8082/api/home/todos/${id}`)
    
    const response = await userApi.deleteTodo(id)
    console.log('📝 删除待办事项响应:', response)
    
    // 检查响应格式
    if (response && typeof response === 'object' && 'code' in response) {
      console.log('🏷️ 删除待办事项标准格式响应，code:', response.code, 'message:', response.message)
      
      const successCodes = [200, 0, 201, 204]
      if (successCodes.includes(response.code)) {
        console.log('✅ 删除待办事项成功，响应码:', response.code)
        // 从本地列表中移除
        const index = todoList.value.findIndex(t => t.id === id)
        if (index > -1) {
          todoList.value.splice(index, 1)
        }
      } else {
        console.log('❌ 删除待办事项失败，错误码:', response.code, '错误信息:', response.message)
        const errorMsg = response.message && response.message.trim() !== '' ? response.message : '删除失败'
        ElMessage.error(errorMsg)
      }
    } else {
      // 非标准格式，直接从本地列表中移除
      console.log('📄 删除待办事项非标准格式响应，直接从本地移除')
      const index = todoList.value.findIndex(t => t.id === id)
      if (index > -1) {
        todoList.value.splice(index, 1)
      }
    }
  } catch (error) {
    console.error('删除待办事项失败:', error)
    console.error('错误详情:', error.response?.data)
    
    let errorMessage = '删除失败，请稍后重试'
    if (error.response?.status === 404) {
      errorMessage = '待办事项不存在'
    } else if (error.response?.status === 500) {
      errorMessage = '服务器内部错误，请稍后重试'
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    ElMessage.error(errorMessage)
  }
}

const handleTodoChange = async (todo) => {
  try {
    console.log('🔄 更新待办事项状态:', todo.id, 'completed:', todo.completed)
    console.log('请求URL:', `http://192.168.1.132:8082/api/home/todos/${todo.id}`)
    
    const updateData = {
      title: todo.title,
      description: todo.description || '',
      deadline: todo.deadline,
      priority: todo.priority || 1,
      completed: todo.completed
    }
    
    // 验证日期格式
    if (updateData.deadline) {
      const date = new Date(updateData.deadline)
      if (isNaN(date.getTime())) {
        console.warn('⚠️ 无效的日期格式:', updateData.deadline)
        ElMessage.error('日期格式无效')
        // 回滚状态
        todo.completed = !todo.completed
        return
      }
    }
    
    console.log('📋 完整更新数据:', updateData)
    
    const response = await userApi.updateTodo(todo.id, updateData)
    console.log('📝 更新待办事项响应:', response)
    
    // 检查响应格式
    if (response && typeof response === 'object' && 'code' in response) {
      console.log('🏷️ 更新待办事项标准格式响应，code:', response.code, 'message:', response.message)
      
      const successCodes = [200, 0, 201, 204]
      if (successCodes.includes(response.code)) {
        console.log('✅ 更新待办事项成功，响应码:', response.code)
        // 更新本地列表中的对应项
        const index = todoList.value.findIndex(t => t.id === todo.id)
        if (index > -1) {
          todoList.value[index] = { ...todo }
        }
      } else {
        console.log('❌ 更新待办事项失败，错误码:', response.code, '错误信息:', response.message)
        // 回滚状态
        todo.completed = !todo.completed
        const errorMsg = response.message && response.message.trim() !== '' ? response.message : '更新失败'
        ElMessage.error(errorMsg)
      }
    } else {
      // 非标准格式，直接更新本地状态
      console.log('📄 更新待办事项非标准格式响应，直接更新本地状态')
      const index = todoList.value.findIndex(t => t.id === todo.id)
      if (index > -1) {
        todoList.value[index] = { ...todo }
      }
    }
  } catch (error) {
    console.error('更新待办事项失败:', error)
    console.error('错误详情:', error.response?.data)
    
    // 回滚状态
    todo.completed = !todo.completed
    
    let errorMessage = '更新失败，请稍后重试'
    if (error.response?.status === 404) {
      errorMessage = '待办事项不存在'
    } else if (error.response?.status === 400) {
      errorMessage = '更新数据不合法'
    } else if (error.response?.status === 500) {
      errorMessage = '服务器内部错误，请稍后重试'
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    ElMessage.error(errorMessage)
  }
}

const formatDeadline = (deadline) => {
  if (!deadline) return ''
  const date = new Date(deadline)
  const today = new Date()
  const diffTime = date - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return '已过期'
  if (diffDays === 0) return '今天'
  if (diffDays === 1) return '明天'
  if (diffDays <= 7) return `${diffDays}天后`
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

const getDeadlineType = (deadline) => {
  if (!deadline) return 'info'
  const date = new Date(deadline)
  const today = new Date()
  const diffTime = date - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) return 'danger'
  if (diffDays <= 2) return 'warning'
  return 'success'
}

const getPriorityType = (priority) => {
  switch (priority) {
    case 3: return 'danger'  // 高优先级
    case 2: return 'warning'  // 中优先级
    case 1: 
    default: return 'info'     // 低优先级
  }
}

const getPriorityText = (priority) => {
  switch (priority) {
    case 3: return '高'
    case 2: return '中'
    case 1: 
    default: return '低'
  }
}
</script>

<style lang="scss" scoped>
@import '@/styles/main.scss';

.home-container {
  .welcome-banner {
    position: relative;
    border-radius: 16px;
    padding: 32px;
    margin-bottom: 24px;
    color: white;
    overflow: hidden;
    background-image: url('@/img/jimeng-2025-11-04-5365-现代简约风格，以渐变蓝色为主色调，从浅蓝到深蓝的柔和渐变，画面左侧有一个年轻亚洲....png');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;

    // 背景图片透明度遮罩层 - 50%透明度效果
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(118, 175, 255, 0.5) 0%, rgba(0, 99, 221, 0.5) 100%);
      z-index: 1;
    }

    .banner-content {
      position: relative;
      z-index: 2;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 24px;

      .welcome-text {
        .greeting {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 8px 0;
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;

          .certification-tag {
            font-size: 14px;
            font-weight: 500;
            padding: 6px 16px;
            border-radius: 20px;
          }
        }

        .subtitle {
          font-size: 16px;
          opacity: 0.9;
          margin: 0;
        }
      }

      .banner-stats {
        display: flex;
        gap: 32px;

        .stat-card {
          text-align: center;

          .stat-value {
            font-size: 36px;
            font-weight: 700;
            margin-bottom: 8px;
          }

          .stat-label {
            font-size: 14px;
            opacity: 0.8;
          }
        }
      }
    }
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    font-weight: 600;
    margin: 0 0 20px 0;
    color: $text-primary;
  }

  .main-content-row {
    margin-top: 20px;
  }

  .chart-card {
    margin-bottom: 24px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .skills-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }

  .calendar-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .calendar-cell {
      position: relative;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .date-number {
        font-size: 14px;
      }

      .event-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: $danger-color;
        margin-top: 2px;
      }
    }

    .calendar-events {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px solid $border-color;

      .event-item {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        font-size: 13px;

        .event-title {
          color: $text-regular;
        }
      }
    }
  }

  .todo-card {
    margin-bottom: 20px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .todo-list {
      max-height: 300px;
      overflow-y: auto;

      .todo-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 0;
        border-bottom: 1px solid $border-color;

        &:last-child {
          border-bottom: none;
        }

        &.completed {
          opacity: 0.6;

          .todo-text {
            text-decoration: line-through;
          }
        }

        .todo-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .todo-main {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .todo-text {
          font-size: 13px;
          color: $text-primary;
          margin: 0;
          line-height: 1.4;
        }

        .todo-description {
          font-size: 12px;
          color: $text-secondary;
          margin: 0;
          line-height: 1.4;
        }

        .todo-meta {
          display: flex;
          gap: 6px;
          align-items: center;
          margin-top: 8px;
        }
      }
    }
  }

  .notice-card {
    .notice-item {
      h4 {
        font-size: 14px;
        font-weight: 600;
        margin: 0 0 4px 0;
        color: $text-primary;
      }

      p {
        font-size: 12px;
        color: $text-secondary;
        margin: 0;
        line-height: 1.5;
      }
    }
  }

  .todo-dialog-content {
    .todo-input {
      margin-bottom: 20px;
    }

    .todo-list-full {
      max-height: 400px;
      overflow-y: auto;

      .todo-item-full {
        display: flex;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid $border-color;

        &:last-child {
          border-bottom: none;
        }

        &.completed {
          opacity: 0.6;

          .todo-text {
            text-decoration: line-through;
          }
        }

        .todo-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .todo-main {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .todo-text {
          font-size: 13px;
          color: $text-primary;
          margin: 0;
          line-height: 1.4;
        }

        .todo-description {
          font-size: 12px;
          color: $text-secondary;
          margin: 0;
          line-height: 1.4;
        }

        .todo-meta {
          display: flex;
          gap: 6px;
          align-items: center;
          margin-top: 8px;
        }
      }
    }
  }

  .quick-actions {
    margin-bottom: 32px;

    .action-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 20px;

      .action-card {
        cursor: pointer;
        transition: all 0.3s;
        border: none;

        &:hover {
          transform: translateY(-4px);
        }

        .action-content {
          display: flex;
          align-items: center;
          gap: 16px;

          .action-icon {
            width: 64px;
            height: 64px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
          }

          .action-info {
            flex: 1;

            h3 {
              margin: 0 0 4px 0;
              font-size: 16px;
              font-weight: 600;
              color: $text-primary;
            }

            p {
              margin: 0;
              font-size: 14px;
              color: $text-secondary;
            }
          }
        }
      }
    }
  }

  .recent-courses {
    margin-bottom: 32px;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .course-card {
      margin-bottom: 20px;
      border: none;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-4px);
      }

      .course-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

          .course-credits {
            font-size: 14px;
            color: $text-secondary;
          }
        }

        .course-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: $text-primary;
        }

        .course-enterprise {
          font-size: 14px;
          color: $text-regular;
          margin: 0 0 16px 0;
        }

        .course-progress {
          margin-bottom: 16px;

          .progress-info {
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            color: $text-regular;
            margin-bottom: 8px;
          }
        }

      .course-footer {
        display: flex;
        justify-content: flex-end;
      }
    }
  }

  .notifications {
    .el-timeline {
      padding-left: 0;

      :deep(.el-timeline-item__content) {
        h4 {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: $text-primary;
        }

        p {
          margin: 0;
          font-size: 14px;
          color: $text-regular;
          line-height: 1.6;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .home-container {
    .welcome-banner {
      .banner-content {
        .banner-stats {
          width: 100%;
          justify-content: space-around;
        }
      }
    }

    .quick-actions {
      .action-grid {
        grid-template-columns: 1fr;
      }
    }
  }
}
</style>
