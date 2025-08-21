# Google OAuth 配置指南

## 问题描述

当点击Google登录时出现错误：
```json
{"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"}
```

这表明Supabase项目中的Google OAuth提供商没有正确启用。

## 解决步骤

### 1. 创建Google OAuth应用

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用Google+ API：
   - 导航到 "APIs & Services" > "Library"
   - 搜索 "Google+ API" 并启用
4. 创建OAuth 2.0凭据：
   - 导航到 "APIs & Services" > "Credentials"
   - 点击 "Create Credentials" > "OAuth 2.0 Client IDs"
   - 选择应用类型为 "Web application"
   - 设置授权重定向URI：
     ```
     https://xpqpzonadqrjptwyqbiz.supabase.co/auth/v1/callback
     ```
   - 记录生成的Client ID和Client Secret

### 2. 配置Supabase Authentication

1. 登录 [Supabase Dashboard](https://supabase.com/dashboard)
2. 选择你的项目：`xpqpzonadqrjptwyqbiz`
3. 导航到 "Authentication" > "Providers"
4. 找到 "Google" 提供商并点击配置
5. 启用Google提供商：
   - 将 "Enable sign in with Google" 切换为开启
   - 输入从Google Cloud Console获取的Client ID
   - 输入从Google Cloud Console获取的Client Secret
   - 点击 "Save"

### 3. 更新环境变量

更新 `.env` 文件中的Google OAuth配置：

```env
# Google OAuth配置
VITE_GOOGLE_CLIENT_ID=你的_google_client_id
GOOGLE_CLIENT_SECRET=你的_google_client_secret
```

### 4. 验证配置

1. 重启开发服务器：
   ```bash
   npm run dev
   ```

2. 访问管理员登录页面：`http://localhost:5173/admin/login`

3. 点击 "使用Google登录" 按钮测试

## 重要注意事项

### 授权重定向URI

**重要：** 确保在Google Cloud Console中设置的重定向URI与Supabase项目匹配：

- **开发环境**：`https://xpqpzonadqrjptwyqbiz.supabase.co/auth/v1/callback`
- **生产环境**：`https://xpqpzonadqrjptwyqbiz.supabase.co/auth/v1/callback`

**注意：** Supabase使用统一的回调地址处理所有环境的OAuth重定向，无需为不同环境配置不同的重定向URI。

**⚠️ 常见错误：** 如果看到 `net::ERR_CONNECTION_REFUSED http://localhost:3000/` 错误，说明Google Cloud Console中可能错误配置了 `http://localhost:3000` 作为重定向URI。请确保：

1. **删除** 任何 `localhost:3000` 的重定向URI
2. **只使用** Supabase的回调地址：`https://xpqpzonadqrjptwyqbiz.supabase.co/auth/v1/callback`
3. **不要** 添加本地开发服务器地址作为重定向URI

### 域名验证

在Google Cloud Console的OAuth同意屏幕中，确保添加了授权域名：
- `xpqpzonadqrjptwyqbiz.supabase.co`
- `localhost`（用于开发）

### 测试用户

如果应用处于测试模式，需要在Google Cloud Console中添加测试用户邮箱。

## 常见问题

### Q: 仍然显示 "provider is not enabled"
A: 确保在Supabase Dashboard中正确启用了Google提供商，并且保存了配置。

### Q: 出现 "net::ERR_CONNECTION_REFUSED http://localhost:3000/" 错误
A: 这是最常见的配置错误。解决步骤：
1. 登录 [Google Cloud Console](https://console.cloud.google.com/)
2. 进入你的项目 > APIs & Services > Credentials
3. 点击你的OAuth 2.0客户端ID
4. 在"授权重定向URI"部分，**删除**所有包含 `localhost:3000` 的URI
5. 确保只有 `https://xpqpzonadqrjptwyqbiz.supabase.co/auth/v1/callback` 这一个重定向URI
6. 保存更改并重新测试

### Q: 重定向后显示错误
A: 检查Google Cloud Console中的重定向URI是否正确设置。

### Q: 无法获取用户信息
A: 确保在Google Cloud Console中启用了必要的API（Google+ API或People API）。

## 配置检查清单

- [ ] Google Cloud Console项目已创建
- [ ] Google+ API已启用
- [ ] OAuth 2.0凭据已创建
- [ ] 重定向URI已正确设置
- [ ] Supabase中Google提供商已启用
- [ ] Client ID和Secret已正确配置
- [ ] 环境变量已更新
- [ ] 开发服务器已重启

完成以上步骤后，Google OAuth登录应该可以正常工作。