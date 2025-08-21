-- 为anon角色授予基本读取权限（用于项目访问页面）
GRANT SELECT ON projects TO anon;
GRANT SELECT ON tabs TO anon;

-- 为authenticated角色授予完整权限
GRANT ALL PRIVILEGES ON projects TO authenticated;
GRANT ALL PRIVILEGES ON tabs TO authenticated;

-- 确保序列权限
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;