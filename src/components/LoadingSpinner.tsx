import React from 'react'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'blue' | 'purple' | 'gray' | 'white'
  text?: string
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  color = 'blue', 
  text, 
  className = '' 
}: LoadingSpinnerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4'
      case 'md':
        return 'h-6 w-6'
      case 'lg':
        return 'h-8 w-8'
      case 'xl':
        return 'h-12 w-12'
    }
  }

  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'border-blue-200 border-t-blue-600'
      case 'purple':
        return 'border-purple-200 border-t-purple-600'
      case 'gray':
        return 'border-gray-200 border-t-gray-600'
      case 'white':
        return 'border-white/30 border-t-white'
    }
  }

  const getTextSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs'
      case 'md':
        return 'text-sm'
      case 'lg':
        return 'text-base'
      case 'xl':
        return 'text-lg'
    }
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <div className={`
          animate-spin rounded-full border-4 
          ${getSizeClasses()} 
          ${getColorClasses()}
        `}></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`
            ${size === 'sm' ? 'h-1 w-1' : size === 'md' ? 'h-2 w-2' : size === 'lg' ? 'h-3 w-3' : 'h-4 w-4'}
            ${color === 'blue' ? 'bg-blue-600' : color === 'purple' ? 'bg-purple-600' : color === 'gray' ? 'bg-gray-600' : 'bg-white'}
            rounded-full animate-pulse
          `}></div>
        </div>
      </div>
      {text && (
        <p className={`mt-3 font-medium text-gray-600 ${getTextSizeClasses()}`}>
          {text}
        </p>
      )}
    </div>
  )
}

// 全屏加载组件
export function FullScreenLoading({ text = '加载中...' }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="text-center">
        <LoadingSpinner size="xl" color="blue" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">{text}</h3>
        <p className="mt-2 text-gray-600">请稍候...</p>
      </div>
    </div>
  )
}

// 按钮加载状态组件
export function ButtonLoading({ 
  children, 
  isLoading, 
  loadingText = '处理中...', 
  ...props 
}: {
  children: React.ReactNode
  isLoading: boolean
  loadingText?: string
  [key: string]: any
}) {
  return (
    <button {...props} disabled={isLoading || props.disabled}>
      {isLoading ? (
        <div className="flex items-center justify-center">
          <LoadingSpinner size="sm" color="white" className="mr-2" />
          {loadingText}
        </div>
      ) : (
        children
      )}
    </button>
  )
}

// 内容加载骨架屏
export function ContentSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse">
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div key={index} className="flex space-x-4">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// 卡片加载骨架屏
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-gray-200 rounded-2xl h-48 w-full"></div>
          <div className="mt-4 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  )
}