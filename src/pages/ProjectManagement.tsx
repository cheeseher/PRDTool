import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import { useAuthStore } from '../store/authStore'
import { createProject, updateProject, deleteProject } from '../lib/projects'
import { signOut } from '../lib/auth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  Users, 
  LogOut, 
  Edit, 
  Trash2, 
  Eye, 
  Link as LinkIcon, 
  FolderPlus, 
  Loader2, 
  Check,
  Calendar,
  Globe,
  Lock,
  MoreHorizontal
} from 'lucide-react'

export function ProjectManagement() {
  const { projects, isLoading, fetchProjects, addProject, updateProject: updateProjectInStore, removeProject } = useProjectStore()
  const { user, logout } = useAuthStore()
  const { toast } = useToast()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [copiedTokens, setCopiedTokens] = useState<Set<string>>(new Set())
  
  useEffect(() => {
    fetchProjects()
  }, [])
  
  const handleLogout = async () => {
    try {
      await signOut()
      logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  
  const handleCreateProject = async (data: { name: string; description: string; password: string }) => {
    setIsSubmitting(true)
    try {
      const project = await createProject(data.name, data.description, data.password || undefined)
      addProject(project)
      setShowCreateModal(false)
      toast({
        title: "创建成功",
        description: `项目 "${data.name}" 已创建`,
      })
    } catch (error) {
      console.error('Error creating project:', error)
      toast({
        title: "创建失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleUpdateProject = async (id: string, data: { name: string; description: string; password: string }) => {
    setIsSubmitting(true)
    try {
      const project = await updateProject(id, { name: data.name, description: data.description }, data.password || undefined)
      updateProjectInStore(project)
      setEditingProject(null)
      toast({
        title: "更新成功",
        description: `项目 "${data.name}" 已更新`,
      })
    } catch (error) {
      console.error('Error updating project:', error)
      toast({
        title: "更新失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`确定要删除项目 "${name}" 吗？此操作不可撤销。`)) return
    
    try {
      await deleteProject(id)
      removeProject(id)
      toast({
        title: "删除成功",
        description: `项目 "${name}" 已删除`,
      })
    } catch (error) {
      console.error('Error deleting project:', error)
      toast({
        title: "删除失败",
        description: "请检查网络连接后重试",
        variant: "destructive",
      })
    }
  }
  
  const copyAccessLink = async (token: string, projectName: string) => {
    try {
      setCopiedTokens(prev => new Set(prev).add(token))
      
      const link = `${window.location.origin}/access/${token}`
      await navigator.clipboard.writeText(link)
      
      toast({
        title: "复制成功",
        description: `${projectName} 的访问链接已复制到剪贴板`,
        duration: 2000,
      })
      
      setTimeout(() => {
        setCopiedTokens(prev => {
          const newSet = new Set(prev)
          newSet.delete(token)
          return newSet
        })
      }, 500)
    } catch (error) {
      setCopiedTokens(prev => {
        const newSet = new Set(prev)
        newSet.delete(token)
        return newSet
      })
      toast({
        title: "复制失败",
        description: "无法复制到剪贴板，请手动复制",
        variant: "destructive",
      })
    }
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">加载项目中...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航栏 - 全宽设计 */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <div className="mr-6 flex items-center space-x-2">
              <Users className="h-6 w-6" />
              <span className="font-bold">团队协作工具</span>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="flex items-center space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user?.name}</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              退出登录
            </Button>
          </div>
        </div>
      </header>
      
      {/* 主内容区域 */}
      <div className="container py-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between space-y-2 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">项目管理</h1>
            <p className="text-muted-foreground">
              创建和管理您的团队协作项目
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            创建项目
          </Button>
        </div>
        
        {projects.length === 0 ? (
          /* 空状态 */
          <Card className="flex flex-col items-center justify-center py-16">
            <CardContent className="text-center">
              <FolderPlus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">还没有项目</CardTitle>
              <CardDescription className="mb-4">
                创建您的第一个项目来开始协作
              </CardDescription>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                创建项目
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* 项目网格 */
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {project.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{project.name}</CardTitle>
                        {project.password && (
                          <div className="flex items-center space-x-1 mt-1">
                            <Lock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">需要密码</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingProject(project)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProject(project.id, project.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {project.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(project.created_at).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Globe className="h-3 w-3" />
                      <span>公开</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button asChild className="flex-1" size="sm">
                      <Link to={`/project/${project.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        进入项目
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyAccessLink(project.token, project.name)}
                      disabled={copiedTokens.has(project.token)}
                    >
                      {copiedTokens.has(project.token) ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <LinkIcon className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* 创建/编辑项目模态框 */}
      {(showCreateModal || editingProject) && (
        <ProjectModal
          project={editingProject}
          isOpen={showCreateModal || !!editingProject}
          onClose={() => {
            setShowCreateModal(false)
            setEditingProject(null)
          }}
          onSubmit={editingProject ? 
            (data) => handleUpdateProject(editingProject.id, data) :
            handleCreateProject
          }
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  )
}

// 项目创建/编辑模态框组件
function ProjectModal({ project, isOpen, onClose, onSubmit, isSubmitting }: {
  project?: any
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; description: string; password: string }) => void
  isSubmitting: boolean
}) {
  const [name, setName] = useState(project?.name || '')
  const [description, setDescription] = useState(project?.description || '')
  const [password, setPassword] = useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ 
      name: name.trim(), 
      description: description.trim(), 
      password: password.trim() 
    })
  }
  
  if (!isOpen) return null
  
  return (
    <>
      {/* 遮罩层 */}
      <div 
        className="fixed inset-0 bg-black/80 z-50"
        onClick={onClose}
      />
      
      {/* 模态框 */}
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
        <div className="flex flex-col space-y-1.5 text-center sm:text-left">
          <h2 className="text-lg font-semibold leading-none tracking-tight">
            {project ? '编辑项目' : '创建项目'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {project ? '修改项目信息和设置' : '创建一个新的团队协作项目'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              项目名称 *
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入项目名称"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              项目描述
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="输入项目描述（可选）"
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              访问密码 {project ? '(留空表示不修改)' : '(可选)'}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={project ? "留空表示不修改" : "设置访问密码（可选）"}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting || !name.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                project ? '更新项目' : '创建项目'
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}