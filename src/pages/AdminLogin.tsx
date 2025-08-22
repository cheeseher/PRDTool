import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { signIn, signInWithGoogle } from '../lib/auth'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { DevAuthBypass, isDevelopment, DEV_MOCK_USERS } from '../lib/devUtils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Users, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'

export function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore()
  
  const from = location.state?.from?.pathname || '/admin/projects'
  
  // 检查认证状态并处理跳转
  useEffect(() => {
    // 检查是否是OAuth回调
    const urlParams = new URLSearchParams(location.search)
    const isOAuthCallback = urlParams.has('code') || urlParams.has('access_token') || urlParams.get('oauth') === 'success'
    
    if (isOAuthCallback) {
      // OAuth回调处理
      const handleOAuthCallback = async () => {
        try {
          // 等待认证状态更新
          await new Promise(resolve => setTimeout(resolve, 2000))
          
          // 检查用户状态
          const { data: { user: currentUser } } = await supabase.auth.getUser()
          
          if (currentUser) {
            // 清除URL参数并跳转
            window.history.replaceState({}, '', '/admin/login')
            navigate('/admin/projects', { replace: true })
          } else {
            setError('OAuth登录失败，请重试')
          }
        } catch (err) {
          console.error('OAuth callback error:', err)
          setError('OAuth登录处理失败')
        }
      }
      
      handleOAuthCallback()
    } else if (!authLoading && isAuthenticated && user?.is_admin) {
      // 正常的认证状态检查
      navigate(from, { replace: true })
    }
  }, [authLoading, isAuthenticated, user, navigate, from, location.search])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      await signIn(email, password)
      // 登录成功后，useEffect会处理跳转
    } catch (err: any) {
      setError(err.message || '登录失败，请检查邮箱和密码')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      await signInWithGoogle()
      // Google登录会重定向，认证状态变化后useEffect会处理跳转
    } catch (err: any) {
      setError(err.message || 'Google登录失败')
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4">
      <div className="max-w-md w-full">
        {/* Logo和标题区域 */}
        <div className="text-center mb-8">
          <div className="mx-auto h-20 w-20 bg-primary rounded-3xl flex items-center justify-center mb-6 shadow-lg transition-all duration-300 hover:scale-105">
            <div className="relative">
              <svg className="h-10 w-10 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            欢迎回来
          </h2>
          <p className="text-muted-foreground">
            登录到团队协作工具管理后台
          </p>
        </div>
        
        {/* 登录卡片 */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">管理员登录</CardTitle>
            <CardDescription>
              请使用您的管理员账户登录系统
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  {error}
                </div>
              )}
          
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    邮箱地址
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="请输入您的邮箱地址"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    密码
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    placeholder="请输入您的密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
          
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                    登录中...
                  </>
                ) : (
                  '立即登录'
                )}
              </Button>
          
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">或者</span>
                </div>
              </div>
          
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={isLoading || authLoading}
                className="w-full"
                size="lg"
              >
                <svg className="w-5 h-5 mr-1" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {(isLoading || authLoading) ? '登录中...' : '使用 Google 登录'}
              </Button>
          
              {/* 开发环境认证绕过选项 */}
              {isDevelopment() && (
                <>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <Separator className="w-full" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <Badge variant="outline" className="bg-background px-2 text-orange-600 border-orange-200">
                        🛠️ 开发环境选项
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        DevAuthBypass.enable()
                        DevAuthBypass.setMockUser('admin')
                        navigate('/admin/projects', { replace: true })
                      }}
                      className="w-full"
                      size="lg"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      跳过认证（管理员模式）
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        DevAuthBypass.enable()
                        DevAuthBypass.setMockUser('user')
                        navigate('/admin/projects', { replace: true })
                      }}
                      className="w-full"
                      size="lg"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      跳过认证（普通用户模式）
                    </Button>
                    
                    <div className="text-xs text-muted-foreground text-center">
                      💡 提示：按 Ctrl+Shift+D 可快速切换认证绕过状态
                    </div>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}