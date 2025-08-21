import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DndProvider, useDrag, useDrop } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  ArrowLeftIcon,
  Bars3Icon
} from '@heroicons/react/24/outline'
import { useProjectStore } from '../store/projectStore'
import { createTab, updateTab, deleteTab, updateTabsOrder } from '../lib/projects'
import type { Tab } from '../lib/supabase'

const ItemType = 'TAB'

interface DragItem {
  id: string
  index: number
}

export function TabManagement() {
  const { id } = useParams<{ id: string }>()
  const { 
    currentProject, 
    currentTabs, 
    fetchProject, 
    fetchProjectTabs, 
    addTab, 
    updateTab: updateTabInStore, 
    removeTab,
    reorderTabs
  } = useProjectStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTab, setEditingTab] = useState<Tab | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  useEffect(() => {
    if (id) {
      fetchProject(id)
      fetchProjectTabs(id)
    }
  }, [id])
  
  const handleCreateTab = async (data: { name: string; url: string }) => {
    if (!id) return
    
    setIsSubmitting(true)
    try {
      const tab = await createTab(id, data.name, data.url)
      addTab(tab)
      setShowCreateModal(false)
    } catch (error) {
      console.error('Error creating tab:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleUpdateTab = async (tabId: string, data: { name: string; url: string }) => {
    setIsSubmitting(true)
    try {
      const tab = await updateTab(tabId, data)
      updateTabInStore(tab)
      setEditingTab(null)
    } catch (error) {
      console.error('Error updating tab:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleDeleteTab = async (tabId: string) => {
    if (!confirm('确定要删除这个标签页吗？')) return
    
    try {
      await deleteTab(tabId)
      removeTab(tabId)
    } catch (error) {
      console.error('Error deleting tab:', error)
    }
  }
  
  const moveTab = async (dragIndex: number, hoverIndex: number) => {
    const dragTab = currentTabs[dragIndex]
    const newTabs = [...currentTabs]
    newTabs.splice(dragIndex, 1)
    newTabs.splice(hoverIndex, 0, dragTab)
    
    // 更新本地状态
    reorderTabs(newTabs)
    
    // 更新服务器
    try {
      const updates = newTabs.map((tab, index) => ({
        id: tab.id,
        order_index: index + 1
      }))
      await updateTabsOrder(updates)
    } catch (error) {
      console.error('Error updating tab order:', error)
      // 如果失败，重新获取数据
      if (id) fetchProjectTabs(id)
    }
  }
  
  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">项目不存在</h1>
          <Link
            to="/admin/projects"
            className="text-blue-600 hover:text-blue-500"
          >
            返回项目列表
          </Link>
        </div>
      </div>
    )
  }
  
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50">
        {/* 顶部导航 */}
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link
                  to={`/project/${currentProject.id}`}
                  className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-1" />
                  返回
                </Link>
                <h1 className="text-xl font-semibold text-gray-900">
                  {currentProject.name} - 标签页管理
                </h1>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  添加标签页
                </button>
              </div>
            </div>
          </div>
        </nav>
        
        {/* 主要内容 */}
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {currentTabs.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="mt-2 text-sm font-medium text-gray-900">暂无标签页</h3>
                <p className="mt-1 text-sm text-gray-500">开始添加一些链接吧。</p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                    添加标签页
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-blue-700">
                    <Bars3Icon className="inline h-4 w-4 mr-1" />
                    提示：您可以拖拽标签页来调整顺序
                  </p>
                </div>
                
                {currentTabs.map((tab, index) => (
                  <DraggableTabItem
                    key={tab.id}
                    tab={tab}
                    index={index}
                    moveTab={moveTab}
                    onEdit={() => setEditingTab(tab)}
                    onDelete={() => handleDeleteTab(tab.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* 创建/编辑标签页模态框 */}
        {(showCreateModal || editingTab) && (
          <TabModal
            tab={editingTab}
            isOpen={showCreateModal || !!editingTab}
            onClose={() => {
              setShowCreateModal(false)
              setEditingTab(null)
            }}
            onSubmit={editingTab ? 
              (data) => handleUpdateTab(editingTab.id, data) :
              handleCreateTab
            }
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </DndProvider>
  )
}

// 可拖拽的标签页项目组件
function DraggableTabItem({ tab, index, moveTab, onEdit, onDelete }: {
  tab: Tab
  index: number
  moveTab: (dragIndex: number, hoverIndex: number) => void
  onEdit: () => void
  onDelete: () => void
}) {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { id: tab.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  })
  
  const [, drop] = useDrop({
    accept: ItemType,
    hover: (item: DragItem) => {
      if (item.index !== index) {
        moveTab(item.index, index)
        item.index = index
      }
    }
  })
  

  
  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`bg-white rounded-lg shadow p-6 cursor-move transition-opacity ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <Bars3Icon className="h-5 w-5 text-gray-400" />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-medium text-gray-900">{tab.name}</h3>
            </div>
            <p className="mt-1 text-sm text-gray-600 break-all">{tab.url}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="text-gray-400 hover:text-gray-600"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={onDelete}
            className="text-gray-400 hover:text-red-600"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// 标签页创建/编辑模态框组件
function TabModal({ tab, isOpen, onClose, onSubmit, isSubmitting }: {
  tab?: Tab | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: { name: string; url: string }) => void
  isSubmitting: boolean
}) {
  const [name, setName] = useState(tab?.name || '')
  const [url, setUrl] = useState(tab?.url || '')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ name, url })
  }
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {tab ? '编辑标签页' : '添加标签页'}
          </h3>
          

          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">标签页名称</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="输入标签页名称"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">链接地址</label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com"
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
                {isSubmitting ? '保存中...' : (tab ? '更新' : '添加')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}