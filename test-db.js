// 测试数据库连接和创建项目的脚本
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// 加载环境变量
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('缺少Supabase配置信息')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  console.log('🔍 测试数据库连接...')
  
  try {
    // 1. 检查数据库连接
    const { data: projects, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .limit(5)
    
    if (fetchError) {
      console.error('❌ 数据库连接失败:', fetchError.message)
      return
    }
    
    console.log('✅ 数据库连接成功')
    console.log(`📊 当前项目数量: ${projects.length}`)
    
    if (projects.length > 0) {
      console.log('📋 现有项目:')
      projects.forEach(project => {
        console.log(`  - ${project.name} (token: ${project.token})`)
        console.log(`    访问链接: http://localhost:5173/access/${project.token}`)
      })
    } else {
      console.log('📝 创建测试项目...')
      
      // 2. 创建测试项目
      const testToken = crypto.randomUUID()
      const { data: newProject, error: createError } = await supabase
        .from('projects')
        .insert({
          name: '测试项目',
          description: '这是一个用于测试的项目',
          token: testToken,
          created_by: null // 暂时设为null，因为没有用户认证
        })
        .select()
        .single()
      
      if (createError) {
        console.error('❌ 创建项目失败:', createError.message)
        return
      }
      
      console.log('✅ 测试项目创建成功')
      console.log(`📋 项目名称: ${newProject.name}`)
      console.log(`🔗 访问链接: http://localhost:5173/access/${newProject.token}`)
      
      // 3. 为测试项目创建一些标签页
      const tabs = [
        { name: '首页', url: 'https://www.baidu.com' },
        { name: 'GitHub', url: 'https://github.com' },
        { name: '文档', url: 'https://docs.github.com' }
      ]
      
      for (let i = 0; i < tabs.length; i++) {
        const tab = tabs[i]
        const { error: tabError } = await supabase
          .from('tabs')
          .insert({
            project_id: newProject.id,
            name: tab.name,
            url: tab.url,
            order_index: i + 1,
            is_visible: true
          })
        
        if (tabError) {
          console.error(`❌ 创建标签页 "${tab.name}" 失败:`, tabError.message)
        } else {
          console.log(`✅ 标签页 "${tab.name}" 创建成功`)
        }
      }
    }
    
    console.log('\n🎉 测试完成！')
    console.log('💡 提示: 请访问 http://localhost:5173/ 查看项目管理页面')
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error)
  }
}

testDatabase()