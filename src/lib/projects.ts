import { supabase } from './supabase'
import type { Project, Tab } from './supabase'

// 获取所有项目
export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}

// 根据ID获取项目
export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching project:', error)
    return null
  }
  
  return data
}

// 根据访问令牌获取项目
export async function getProjectByToken(token: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('token', token)
    .single()
  
  if (error) {
    console.error('Error fetching project by token:', error)
    return null
  }
  
  return data
}

// 创建项目
export async function createProject(name: string, description?: string, password?: string): Promise<Project> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  
  // 生成唯一的访问令牌
  const token = crypto.randomUUID()
  
  const { data, error } = await supabase
    .from('projects')
    .insert({
      name,
      description,
      password: password || null,
      token,
      created_by: user.id
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// 更新项目
export async function updateProject(id: string, updates: Partial<Pick<Project, 'name' | 'description'>>, password?: string): Promise<Project> {
  let updateData: any = { ...updates }
  
  if (password !== undefined) {
    updateData.password = password || null
  }
  
  const { data, error } = await supabase
    .from('projects')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// 删除项目
export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// 验证项目密码
export async function verifyProjectPassword(projectId: string, password: string): Promise<boolean> {
  const project = await getProject(projectId)
  if (!project || !project.password) return true
  
  return password === project.password
}

// 获取项目的标签页
export async function getProjectTabs(projectId: string): Promise<Tab[]> {
  const { data, error } = await supabase
    .from('tabs')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index', { ascending: true })
  
  if (error) throw error
  return data || []
}

// 创建标签页
export async function createTab(projectId: string, name: string, url: string): Promise<Tab> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  
  // 获取当前最大的order_index
  const { data: existingTabs } = await supabase
    .from('tabs')
    .select('order_index')
    .eq('project_id', projectId)
    .order('order_index', { ascending: false })
    .limit(1)
  
  const maxOrder = existingTabs?.[0]?.order_index || 0
  
  const { data, error } = await supabase
    .from('tabs')
    .insert({
      project_id: projectId,
      name,
      url,
      order_index: maxOrder + 1,
      is_visible: true
    })
    .select()
    .single()
  
  if (error) throw error
  return data
}

// 更新标签页
export async function updateTab(id: string, updates: Partial<Pick<Tab, 'name' | 'url' | 'is_visible'>>): Promise<Tab> {
  const { data, error } = await supabase
    .from('tabs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// 删除标签页
export async function deleteTab(id: string): Promise<void> {
  const { error } = await supabase
    .from('tabs')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// 更新标签页顺序
export async function updateTabsOrder(tabs: { id: string; order_index: number }[]): Promise<void> {
  const updates = tabs.map(tab => 
    supabase
      .from('tabs')
      .update({ order_index: tab.order_index })
      .eq('id', tab.id)
  )
  
  await Promise.all(updates)
}