import React from 'react'
import { Outlet } from 'react-router-dom'

interface LayoutProps {
  children?: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children || <Outlet />}
    </div>
  )
}

// 管理员布局
export function AdminLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children || <Outlet />}
      </div>
    </div>
  )
}

// 项目访问布局
export function ProjectLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      {children || <Outlet />}
    </div>
  )
}