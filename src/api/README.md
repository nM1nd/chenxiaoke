# API 使用说明

## 在Vue组件中使用API

### 导入API
```javascript
import { userApi, courseApi } from '@/api'
```

### 在Home.vue中的使用示例

```javascript
// 在 <script setup> 中添加
import { ref, onMounted } from 'vue'
import { userApi, courseApi } from '@/api'

// 替换现有的硬编码数据为动态获取
const userInfo = ref({ name: '张三' })
const recentCourses = ref([])

// 页面加载时获取数据
onMounted(async () => {
  await fetchUserInfo()
  await fetchRecentCourses()
})

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const data = await userApi.getUserInfo()
    userInfo.value = data
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 获取最近课程
const fetchRecentCourses = async () => {
  try {
    const data = await courseApi.getCourses({ 
      page: 1, 
      limit: 3,
      status: 'recent' 
    })
    recentCourses.value = data.list || []
  } catch (error) {
    console.error('获取课程列表失败:', error)
  }
}

// 用户登录示例
const handleLogin = async (credentials) => {
  try {
    const data = await userApi.login(credentials)
    // 保存token
    localStorage.setItem('token', data.token)
    // 跳转到首页
    router.push('/home')
  } catch (error) {
    console.error('登录失败:', error)
  }
}

// 选课示例
const handleSelectCourse = async (courseId) => {
  try {
    await courseApi.selectCourse(courseId)
    // 刷新课程列表
    await fetchRecentCourses()
  } catch (error) {
    console.error('选课失败:', error)
  }
}
```

## API 端点说明

### 用户API (userApi)
- `login(data)` - 用户登录
- `getUserInfo()` - 获取用户信息
- `updateUserInfo(data)` - 更新用户信息

### 课程API (courseApi)
- `getCourses(params)` - 获取课程列表
- `selectCourse(courseId)` - 选课
- `getProgress(courseId)` - 获取学习进度

## 错误处理

axios拦截器已经配置了统一错误处理：
- 401状态码会自动跳转到登录页面
- 所有响应会自动提取response.data
- 请求会自动添加Authorization头部

## 数据格式

后端返回的数据格式应该为：
```javascript
{
  "code": 200,
  "message": "success",
  "data": {
    // 实际数据
  }
}
```