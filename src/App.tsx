import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'
import { Layout, AdminLayout, ProjectLayout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminLogin } from './pages/AdminLogin'
import { ProjectManagement } from './pages/ProjectManagement'
import { MainWorkspace } from './pages/MainWorkspace'
import { ProjectAccess } from './pages/ProjectAccess'
import { TabManagement } from './pages/TabManagement'

function App() {
  const { initialize } = useAuthStore()
  
  useEffect(() => {
    initialize()
  }, [])
  
  return (
    <Router>
      <Routes>
        {/* 公开路由 */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/access/:token" element={<ProjectAccess />} />
        
        {/* 受保护的管理员路由 */}
        <Route path="/admin/projects" element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <ProjectManagement />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        {/* 受保护的项目路由 */}
        <Route path="/project/:id" element={
          <ProtectedRoute requireAdmin>
            <ProjectLayout>
              <MainWorkspace />
            </ProjectLayout>
          </ProtectedRoute>
        } />
        
        <Route path="/project/:id/manage" element={
          <ProtectedRoute requireAdmin>
            <AdminLayout>
              <TabManagement />
            </AdminLayout>
          </ProtectedRoute>
        } />
        
        {/* 默认重定向 */}
        <Route path="/" element={<Navigate to="/admin/projects" replace />} />
        <Route path="*" element={
          <Layout>
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">页面不存在</h1>
                <p className="text-gray-600">您访问的页面不存在。</p>
              </div>
            </div>
          </Layout>
        } />
      </Routes>
    </Router>
  )
}

export default App
