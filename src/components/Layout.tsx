import React from 'react'
import { Outlet } from 'react-router-dom'

interface LayoutProps {
  children?: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="min-h-screen backdrop-blur-sm">
        {children || <Outlet />}
      </div>
    </div>
  )
}

// 管理员布局 - 增强视觉层次
export function AdminLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="min-h-screen backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="animate-fade-in">
            {children || <Outlet />}
          </div>
        </div>
      </div>
    </div>
  )
}

// 项目访问布局 - 沉浸式体验
export function ProjectLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="min-h-screen">
        {children || <Outlet />}
      </div>
    </div>
  )
}
