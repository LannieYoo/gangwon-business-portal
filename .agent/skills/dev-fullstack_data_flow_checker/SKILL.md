# Full-Stack Data Flow Checker Skill

## 角色定位
全栈数据流一致性检查专家，专门检查从数据库到后端到前端的完整数据流，确保字段在各层之间正确传递。

## 核心能力

### 1. 数据库层检查
- 检查数据库表结构和字段定义
- 验证迁移文件是否正确执行
- 确认字段类型、约束、默认值
- 检查实际数据是否存在

### 2. 后端层检查
- **Models (数据模型)**
  - 检查 SQLAlchemy/ORM 模型字段定义
  - 验证字段类型映射是否正确
  - 确认关系和外键定义

- **Schemas (数据验证)**
  - 检查 Pydantic/Schema 定义
  - 验证请求 Schema (Create/Update)
  - 验证响应 Schema (Response)
  - 确认字段是否在所有相关 Schema 中

- **Service (业务逻辑)**
  - 检查查询方法是否返回字段
  - 检查更新方法是否处理字段
  - 检查删除方法是否考虑字段
  - **重点检查响应构造方法** (如 `get_xxx_response`, `update_xxx_response`)
  - 验证字段映射是否完整

- **API Routes (路由)**
  - 检查 API 端点是否正确使用 Schema
  - 验证请求/响应处理

### 3. 前端层检查
- **State Management (状态管理)**
  - 检查 Hook/Store 中的字段定义
  - 验证初始状态是否包含字段
  - 确认字段命名转换 (snake_case ↔ camelCase)

- **API Service (API 服务)**
  - 检查 API 调用是否传递字段
  - 验证响应处理是否提取字段
  - 确认字段转换逻辑

- **Components (组件)**
  - 检查表单组件是否包含字段输入
  - 验证显示组件是否渲染字段
  - 确认字段绑定和事件处理

- **Translations (翻译)**
  - 检查 i18n 文件是否包含字段标签
  - 验证所有语言版本的完整性

### 4. 数据流追踪
- 从数据库到前端的完整路径追踪
- 识别数据流断点
- 定位缺失的字段映射
- 验证命名转换的一致性

## 检查清单

### 添加新字段时的完整检查

#### 数据库层
- [ ] 创建迁移文件
- [ ] 执行迁移 (ALTER TABLE)
- [ ] 验证字段已添加到表中
- [ ] 检查实际数据

#### 后端层
- [ ] 更新 Model 类 (models.py)
- [ ] 更新 Create Schema
- [ ] 更新 Update Schema
- [ ] 更新 Response Schema
- [ ] 更新 Service 查询方法
  - [ ] `get_xxx` 方法
  - [ ] `get_xxx_response` 方法 ⚠️ **常见遗漏点**
- [ ] 更新 Service 更新方法
  - [ ] `update_xxx` 方法
  - [ ] `update_xxx_response` 方法 ⚠️ **常见遗漏点**
- [ ] 更新 Service 删除方法 (如需要)
- [ ] 检查 API 路由

#### 前端层
- [ ] 更新 Hook/Store state
- [ ] 更新 API service 调用
- [ ] 更新表单组件
- [ ] 更新显示组件
- [ ] 更新枚举/常量定义 (如需要)
- [ ] 更新翻译文件 (所有语言)

### 修复数据流问题时的检查

#### 症状：保存成功但查询返回 null
**最可能的原因：响应构造方法缺失字段映射**

检查顺序：
1. 验证数据库中有数据
2. 检查 Service 的 `get_xxx_response` 方法
3. 检查 Service 的 `update_xxx_response` 方法
4. 检查 Response Schema 定义
5. 检查前端 API 响应处理

#### 症状：前端显示 undefined
检查顺序：
1. 检查 API 响应是否包含字段
2. 检查字段命名转换 (snake_case ↔ camelCase)
3. 检查 Hook/Store 是否处理字段
4. 检查组件是否正确访问字段

#### 症状：保存失败
检查顺序：
1. 检查前端是否发送字段
2. 检查 Update Schema 是否包含字段
3. 检查 Service 更新方法是否处理字段
4. 检查数据库约束

## 使用方法

### 场景 1: 添加新字段前的预检查
```
使用 dev-fullstack_data_flow_checker skill
检查添加字段 [field_name] 到 [table_name] 需要修改的所有位置
```

### 场景 2: 数据流问题诊断
```
使用 dev-fullstack_data_flow_checker skill
诊断字段 [field_name] 的数据流问题
症状: [描述问题]
```

### 场景 3: 完整性验证
```
使用 dev-fullstack_data_flow_checker skill
验证字段 [field_name] 在整个技术栈中的一致性
```

## 检查脚本

### 数据库字段检查脚本

**位置**: `.github/ai-dev-config/core/skills/dev-fullstack_data_flow_checker/scripts/check_database_fields.py`

**使用方法**:
```bash
# 1. 复制脚本到项目 backend 目录
cp .github/ai-dev-config/core/skills/dev-fullstack_data_flow_checker/scripts/check_database_fields.py backend/

# 2. 修改脚本中的配置
# TABLE_NAME = 'your_table'
# FIELDS_TO_CHECK = ['field1', 'field2']

# 3. 运行检查
cd backend
uv run python check_database_fields.py
```

**功能**:
- ✅ 检查字段是否存在
- ✅ 显示实际数据示例
- ✅ 统计字段填充率
- ✅ 识别空值问题

### 后端代码检查清单

使用 `rg` (ripgrep) 命令快速检查：

```bash
# 1. 检查 models.py 中的字段定义
rg "class YourModel" backend/src/common/modules/db/models.py -A 50

# 2. 检查 schemas.py 中的所有 Schema
rg "class.*Schema" backend/src/modules/xxx/schemas.py -A 20

# 3. 检查 service.py 中的响应构造方法
rg "def.*_response" backend/src/modules/xxx/service.py -A 30

# 4. 检查字段在整个后端的使用情况
rg "your_field_name" backend/src/
```

## 常见问题和解决方案

### 问题 1: 保存成功但查询返回 null
**根因**: Service 的响应构造方法缺失字段映射

**解决方案**:
```python
# 在 service.py 中找到所有响应构造方法
# 通常命名为: get_xxx_response, update_xxx_response, list_xxx_response

async def get_xxx_response(self, id: UUID) -> XxxResponse:
    record = await self.get_xxx(id)
    return XxxResponse(
        id=record["id"],
        # ... 其他字段 ...
        new_field=record.get("new_field"),  # ⚠️ 添加这行
    )

async def update_xxx_response(self, id: UUID, data: XxxUpdate) -> XxxResponse:
    record = await self.update_xxx(id, data)
    return XxxResponse(
        id=record["id"],
        # ... 其他字段 ...
        new_field=record.get("new_field"),  # ⚠️ 添加这行
    )
```

### 问题 2: 前端字段显示 undefined
**根因**: 字段命名转换问题或 Hook 未处理

**解决方案**:
```javascript
// 检查 API 响应的字段名
console.log('API Response:', response);

// 确认 Hook 中的字段名
const [state, setState] = useState({
  newField: null, // camelCase
});

// 确认 API service 的转换
// 后端: new_field (snake_case)
// 前端: newField (camelCase)
```

### 问题 3: 字段保存失败
**根因**: Schema 验证失败或数据库约束

**解决方案**:
1. 检查 Update Schema 是否包含字段
2. 检查字段类型是否匹配
3. 检查数据库约束 (NOT NULL, UNIQUE 等)
4. 检查字段长度限制

## 最佳实践

### 1. 添加字段的标准流程
1. **规划阶段**: 确定字段名、类型、约束
2. **数据库层**: 创建并执行迁移
3. **后端层**: 按顺序更新 Model → Schema → Service
4. **前端层**: 按顺序更新 Hook → Component → Translation
5. **验证阶段**: 使用检查脚本验证完整性
6. **测试阶段**: 测试 CRUD 操作

### 2. 命名规范
- **数据库/后端**: snake_case (例: `gangwon_industry`)
- **前端**: camelCase (例: `gangwonIndustry`)
- **保持一致性**: 同一字段在各层使用对应的命名规范

### 3. 响应构造方法检查
⚠️ **这是最容易遗漏的地方！**

每次添加字段后，必须检查所有响应构造方法：
- `get_xxx_response`
- `update_xxx_response`
- `list_xxx_response`
- `create_xxx_response`

### 4. 使用检查脚本
- 添加字段后立即运行数据库检查脚本
- 验证数据可以正确保存和查询
- 在前端测试前确保后端完全正常

**检查脚本使用**:
```bash
# 复制并配置检查脚本
cp .github/ai-dev-config/core/skills/dev-fullstack_data_flow_checker/scripts/check_database_fields.py backend/

# 修改配置后运行
cd backend
uv run python check_database_fields.py
```

### 5. 分层测试
1. 先测试数据库层 (SQL 查询)
2. 再测试后端层 (API 调用)
3. 最后测试前端层 (UI 交互)

## 工具和命令

### 数据库检查
```bash
# 使用提供的检查脚本
cd backend
uv run python check_database_fields.py
```

### 后端代码检查
```bash
# 搜索字段定义
rg "new_field" backend/src/

# 检查 Schema 定义
rg "class.*Schema" backend/src/modules/xxx/schemas.py

# 检查 Service 响应方法
rg "def.*response" backend/src/modules/xxx/service.py
```

### 前端代码检查
```bash
# 搜索字段使用
rg "newField" frontend/src/

# 检查翻译文件
rg "newField" frontend/src/**/locales/
```

## 总结

这个 Skill 帮助你：
1. ✅ 系统化地检查全栈数据流
2. ✅ 快速定位数据流断点
3. ✅ 避免常见的字段遗漏问题
4. ✅ 确保前后端数据一致性
5. ✅ 提供标准化的检查流程

**记住**: 响应构造方法是最容易遗漏的地方！每次添加字段都要检查所有 `xxx_response` 方法。
