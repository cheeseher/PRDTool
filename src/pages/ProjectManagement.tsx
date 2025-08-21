import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon, PencilIcon, TrashIcon, LinkIcon, EyeIcon } from '@heroicons/react/24/outline'
import { useProjectStore } from '../store/projectStore'
import { useAuthStore } from '../store/authStore'
import { createProject, updateProject, deleteProject } from '../lib/projects'
import { signOut } from '../lib/auth'

export function ProjectManagement() {
  const { projects, isLoading, fetchProjects, addProject, updateProject: updateProjectInStore, removeProject } = useProjectStore()
  const { user, logout } = useAuthStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
  
  const copyAccessLink = (token: string) => {
    const link = `${window.location.origin}/access/${token}`
    navigator.clipboard.writeText(link)
    alert('访问链接已复制到剪贴板')
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">团队协作工具</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden sm:block text-sm text-gray-700">欢迎，{user?.name}</span>
              <span className="sm:hidden text-xs text-gray-700 truncate max-w-20">{user?.name}</span>
              <button
                onClick={handleLogout}
                className="text-xs sm:text-sm text-gray-500 hover:text-gray-700"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">项目管理</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center px-3 sm:px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-4 sm:h-5 w-4 sm:w-5" />
              创建项目
            </button>
          </div>
          
          {projects.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="mt-2 text-sm font-medium text-gray-900">暂无项目</h3>
              <p className="mt-1 text-sm text-gray-500">开始创建您的第一个项目吧。</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  创建项目
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <div key={project.id} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-4 sm:p-6">
                    <div className="flex items-start justify-between">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 truncate pr-2">
                        {project.name}
                      </h3>
                      <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                        <button
                          onClick={() => setEditingProject(project)}
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <PencilIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProject(project.id)}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <TrashIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    </div>
                    {project.description && (
                      <p className="mt-2 text-xs sm:text-sm text-gray-600 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <Link
                        to={`/project/${project.id}`}
                        className="inline-flex items-center justify-center px-3 py-1.5 sm:py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200"
                      >
                        <EyeIcon className="-ml-0.5 mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                        查看
                      </Link>
                      <button
                        onClick={() => copyAccessLink(project.token)}
                        className="inline-flex items-center justify-center px-3 py-1.5 sm:py-1 border border-transparent text-xs font-medium rounded text-green-700 bg-green-100 hover:bg-green-200"
                      >
                        <LinkIcon className="-ml-0.5 mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                        复制链接
                      </button>
                    </div>
                  </div>
                </div>
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
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {project ? '编辑项目' : '创建项目'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">项目名称</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">项目描述</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                访问密码 {project ? '(留空表示不修改)' : '(可选)'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                取消
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? '保存中...' : (project ? '更新' : '创建')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}