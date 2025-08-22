import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import { useAuthStore } from '../store/authStore'
import { createProject, updateProject, deleteProject } from '../lib/projects'
import { signOut } from '../lib/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useToast } from '@/hooks/use-toast'
import { Plus, Users, LogOut, Edit, Trash2, Eye, Link as LinkIcon, FolderPlus, Loader2, Check } from 'lucide-react'

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
    } catch (error) {
      console.error('Error creating project:', error)
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
    } catch (error) {
      console.error('Error updating project:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDeleteProject = async (id: string) => {
    if (!confirm('确定要删除这个项目吗？此操作不可撤销。')) return
    
    try {
      await deleteProject(id)
      removeProject(id)
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }
  
  const copyAccessLink = async (token: string) => {
    try {
      const link = `${window.location.origin}/access/${token}`
      await navigator.clipboard.writeText(link)
      
      // 添加到已复制集合
      setCopiedTokens(prev => new Set(prev).add(token))
      
      // 显示成功Toast
      toast({
        title: "复制成功",
        description: "访问链接已复制到剪贴板",
        duration: 2000,
      })
      
      // 2秒后移除成功状态
      setTimeout(() => {
        setCopiedTokens(prev => {
          const newSet = new Set(prev)
          newSet.delete(token)
          return newSet
        })
      }, 2000)
    } catch (error) {
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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <nav className="bg-card border-b sticky top-0 z-50 w-full">
        <div className="w-full px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">团队协作工具</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">欢迎，{user?.name}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                退出登录
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* 主要内容 */}
      <div className="w-full py-8 px-8">
        <div className="max-w-none">
          {/* 页面标题区域 */}
          <div className="mb-8">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">项目管理</h2>
                <p className="text-muted-foreground">创建和管理您的团队协作项目</p>
              </div>
              <Button
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                创建新项目
              </Button>
            </div>
          </div>
          
          {projects.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <FolderPlus className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">暂无项目</h3>
              <p className="text-muted-foreground mb-8 max-w-sm mx-auto">开始创建您的第一个项目，让团队协作更加高效。</p>
              <Button
                onClick={() => setShowCreateModal(true)}
                size="lg"
              >
                <Plus className="mr-2 h-5 w-5" />
                创建第一个项目
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 desktop:grid-cols-2 desktop-lg:grid-cols-3 desktop-xl:grid-cols-4">
              {projects.map((project) => (
                <Card key={project.id} className="group hover:shadow-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate group-hover:text-primary transition-colors">
                          {project.name}
                        </CardTitle>
                        {project.description && (
                          <CardDescription className="mt-2 line-clamp-2">
                            {project.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex space-x-2 ml-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingProject(project)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProject(project.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex gap-2">
                      <Button asChild className="flex-1" size="sm">
                        <Link to={`/project/${project.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          进入项目
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyAccessLink(project.token)}
                        disabled={copiedTokens.has(project.token)}
                      >
                        {copiedTokens.has(project.token) ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-2" />
                            已复制
                          </>
                        ) : (
                          <>
                            <LinkIcon className="mr-2 h-4 w-4" />
                            复制链接
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
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
    onSubmit({ name, description, password })
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {project ? '编辑项目' : '创建项目'}
          </DialogTitle>
          <DialogDescription>
            {project ? '修改项目信息和设置' : '创建一个新的团队协作项目'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">项目名称</Label>
            <Input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入项目名称"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">项目描述</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="输入项目描述（可选）"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">
              访问密码 {project ? '(留空表示不修改)' : '(可选)'}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={project ? "留空表示不修改" : "设置访问密码（可选）"}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              取消
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                project ? '更新' : '创建'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}