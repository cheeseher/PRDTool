-- 创建项目表
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  password VARCHAR(255),
  token VARCHAR(255) UNIQUE NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建标签页表
CREATE TABLE tabs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全策略
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tabs ENABLE ROW LEVEL SECURITY;

-- 创建项目表的RLS策略
CREATE POLICY "项目创建者可以查看自己的项目" ON projects
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "项目创建者可以插入项目" ON projects
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "项目创建者可以更新自己的项目" ON projects
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "项目创建者可以删除自己的项目" ON projects
  FOR DELETE USING (created_by = auth.uid());

-- 允许通过token公开访问项目（用于项目访问页面）
CREATE POLICY "通过token公开访问项目" ON projects
  FOR SELECT USING (true);

-- 创建标签页表的RLS策略
CREATE POLICY "项目创建者可以查看项目的标签页" ON tabs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tabs.project_id 
      AND projects.created_by = auth.uid()
    )
  );

CREATE POLICY "项目创建者可以插入标签页" ON tabs
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tabs.project_id 
      AND projects.created_by = auth.uid()
    )
  );

CREATE POLICY "项目创建者可以更新标签页" ON tabs
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tabs.project_id 
      AND projects.created_by = auth.uid()
    )
  );

CREATE POLICY "项目创建者可以删除标签页" ON tabs
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = tabs.project_id 
      AND projects.created_by = auth.uid()
    )
  );

-- 允许公开访问标签页（用于项目访问页面）
CREATE POLICY "公开访问标签页" ON tabs
  FOR SELECT USING (true);

-- 创建索引以提高查询性能
CREATE INDEX idx_projects_token ON projects(token);
CREATE INDEX idx_projects_created_by ON projects(created_by);
CREATE INDEX idx_tabs_project_id ON tabs(project_id);
CREATE INDEX idx_tabs_order_index ON tabs(project_id, order_index);

-- 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为项目表创建更新时间戳触发器
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 为标签页表创建更新时间戳触发器
CREATE TRIGGER update_tabs_updated_at BEFORE UPDATE ON tabs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();