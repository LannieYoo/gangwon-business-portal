# 文档模板集合

## README.md 模板

### 基础版本
```markdown
# 项目名称

项目的简短描述（1-2句话说明项目是什么）

## 特性

- 🚀 核心特性1
- 📝 核心特性2  
- 🔧 核心特性3

## 快速开始

### 前置要求
- Node.js >= 16.0.0
- Python >= 3.8
- Docker (可选)

### 安装
\`\`\`bash
# 克隆项目
git clone https://github.com/username/project-name.git
cd project-name

# 安装依赖
npm install
# 或
pip install -r requirements.txt
\`\`\`

### 运行
\`\`\`bash
# 开发模式
npm run dev
# 或
python main.py
\`\`\`

## 使用示例

\`\`\`javascript
// 基本使用示例
import { ProjectName } from 'project-name';

const instance = new ProjectName({
  apiKey: 'your-api-key'
});

const result = await instance.doSomething();
console.log(result);
\`\`\`

## 文档

- 📖 [完整文档](https://docs.example.com)
- 🚀 [快速开始指南](docs/getting-started.md)
- 📚 [API 参考](docs/api/)
- 🏗️ [架构设计](docs/architecture/)

## 贡献

欢迎贡献！请先阅读 [贡献指南](CONTRIBUTING.md)。

## 许可证

本项目采用 [MIT 许可证](LICENSE)。
```

### 完整版本
```markdown
# 项目名称

[![Build Status](https://github.com/username/repo/workflows/CI/badge.svg)](https://github.com/username/repo/actions)
[![Coverage Status](https://codecov.io/gh/username/repo/branch/main/graph/badge.svg)](https://codecov.io/gh/username/repo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/npm/v/package-name.svg)](https://www.npmjs.com/package/package-name)

项目的详细描述，说明项目解决什么问题，为什么需要这个项目。

## 目录

- [特性](#特性)
- [演示](#演示)
- [安装](#安装)
- [快速开始](#快速开始)
- [使用指南](#使用指南)
- [API 文档](#api-文档)
- [配置](#配置)
- [部署](#部署)
- [贡献](#贡献)
- [更新日志](#更新日志)
- [许可证](#许可证)

## 特性

- ✨ **特性1**: 详细描述
- 🚀 **特性2**: 详细描述
- 🔧 **特性3**: 详细描述
- 📱 **响应式设计**: 支持移动端和桌面端
- 🌐 **国际化**: 支持多语言
- 🔒 **安全**: 内置安全最佳实践

## 演示

🔗 [在线演示](https://demo.example.com)

![演示截图](docs/assets/demo.gif)

## 安装

### 使用 npm
\`\`\`bash
npm install package-name
\`\`\`

### 使用 yarn
\`\`\`bash
yarn add package-name
\`\`\`

### 使用 pip
\`\`\`bash
pip install package-name
\`\`\`

### 从源码安装
\`\`\`bash
git clone https://github.com/username/repo.git
cd repo
npm install
npm run build
\`\`\`

## 快速开始

### 1. 基本设置
\`\`\`javascript
import { ProjectName } from 'package-name';

const app = new ProjectName({
  apiKey: process.env.API_KEY,
  debug: true
});
\`\`\`

### 2. 基本使用
\`\`\`javascript
// 示例1: 基本功能
const result = await app.basicFunction('parameter');
console.log(result);

// 示例2: 高级功能
const advancedResult = await app.advancedFunction({
  option1: 'value1',
  option2: 'value2'
});
\`\`\`

### 3. 错误处理
\`\`\`javascript
try {
  const result = await app.someFunction();
} catch (error) {
  console.error('操作失败:', error.message);
}
\`\`\`

## 使用指南

### 基础概念

#### 核心概念1
解释核心概念，提供示例代码。

#### 核心概念2
解释核心概念，提供示例代码。

### 高级用法

#### 自定义配置
\`\`\`javascript
const config = {
  timeout: 5000,
  retries: 3,
  cache: true
};

const app = new ProjectName(config);
\`\`\`

#### 插件系统
\`\`\`javascript
import { PluginName } from 'package-name/plugins';

app.use(new PluginName({
  option: 'value'
}));
\`\`\`

## API 文档

### 类: ProjectName

#### 构造函数
\`\`\`javascript
new ProjectName(options)
\`\`\`

**参数:**
- `options` (Object): 配置选项
  - `apiKey` (string): API 密钥
  - `timeout` (number): 超时时间，默认 5000ms
  - `debug` (boolean): 调试模式，默认 false

#### 方法

##### basicFunction(parameter)
基本功能的描述。

**参数:**
- `parameter` (string): 参数描述

**返回值:**
- `Promise<Object>`: 返回结果对象

**示例:**
\`\`\`javascript
const result = await app.basicFunction('test');
\`\`\`

## 配置

### 环境变量
\`\`\`bash
# .env 文件
API_KEY=your_api_key_here
DEBUG=true
PORT=3000
DATABASE_URL=postgresql://user:pass@localhost/db
\`\`\`

### 配置文件
\`\`\`json
{
  "name": "project-config",
  "version": "1.0.0",
  "settings": {
    "timeout": 5000,
    "retries": 3,
    "cache": {
      "enabled": true,
      "ttl": 3600
    }
  }
}
\`\`\`

## 部署

### Docker 部署
\`\`\`bash
# 构建镜像
docker build -t project-name .

# 运行容器
docker run -p 3000:3000 -e API_KEY=your_key project-name
\`\`\`

### 云平台部署

#### Vercel
\`\`\`bash
npm install -g vercel
vercel --prod
\`\`\`

#### Heroku
\`\`\`bash
git push heroku main
\`\`\`

## 贡献

我们欢迎所有形式的贡献！

### 开发流程
1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发环境设置
\`\`\`bash
# 克隆仓库
git clone https://github.com/username/repo.git
cd repo

# 安装依赖
npm install

# 运行测试
npm test

# 启动开发服务器
npm run dev
\`\`\`

### 代码规范
- 使用 ESLint 和 Prettier
- 遵循 [Conventional Commits](https://conventionalcommits.org/)
- 测试覆盖率不低于 80%

## 更新日志

查看 [CHANGELOG.md](CHANGELOG.md) 了解详细的版本更新信息。

## 支持

- 📧 邮件: support@example.com
- 💬 讨论: [GitHub Discussions](https://github.com/username/repo/discussions)
- 🐛 问题反馈: [GitHub Issues](https://github.com/username/repo/issues)
- 📖 文档: [完整文档](https://docs.example.com)

## 致谢

感谢所有贡献者的努力！

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/username">Your Name</a>
</p>
```

## CONTRIBUTING.md 模板

```markdown
# 贡献指南

感谢您对本项目的关注！我们欢迎所有形式的贡献。

## 行为准则

请阅读并遵守我们的 [行为准则](CODE_OF_CONDUCT.md)。

## 如何贡献

### 报告 Bug

在报告 Bug 之前，请先检查是否已有相关的 Issue。如果没有，请创建新的 Issue 并包含以下信息：

- **Bug 描述**: 清晰简洁的描述
- **重现步骤**: 详细的重现步骤
- **预期行为**: 描述您期望发生的情况
- **实际行为**: 描述实际发生的情况
- **环境信息**: 操作系统、浏览器版本、项目版本等
- **截图**: 如果适用，添加截图帮助说明问题

### 建议新功能

我们欢迎新功能建议！请创建 Issue 并包含：

- **功能描述**: 清晰描述建议的功能
- **使用场景**: 说明为什么需要这个功能
- **实现思路**: 如果有想法，可以简单描述实现方式

### 提交代码

#### 开发环境设置

1. Fork 本仓库
2. 克隆您的 Fork
\`\`\`bash
git clone https://github.com/your-username/project-name.git
cd project-name
\`\`\`

3. 安装依赖
\`\`\`bash
npm install
# 或
pip install -r requirements.txt
pip install -r requirements-dev.txt
\`\`\`

4. 创建开发分支
\`\`\`bash
git checkout -b feature/your-feature-name
\`\`\`

#### 开发流程

1. **编写代码**: 确保代码符合项目规范
2. **编写测试**: 为新功能添加测试用例
3. **运行测试**: 确保所有测试通过
\`\`\`bash
npm test
# 或
pytest
\`\`\`

4. **检查代码质量**:
\`\`\`bash
npm run lint
npm run format
# 或
ruff check .
black .
\`\`\`

5. **提交代码**: 使用规范的提交信息
\`\`\`bash
git add .
git commit -m "feat: add new feature description"
\`\`\`

6. **推送分支**:
\`\`\`bash
git push origin feature/your-feature-name
\`\`\`

7. **创建 Pull Request**: 在 GitHub 上创建 PR

#### 提交信息规范

我们使用 [Conventional Commits](https://conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

示例：
\`\`\`
feat: add user authentication
fix: resolve login redirect issue
docs: update API documentation
\`\`\`

#### Pull Request 指南

- **标题**: 简洁描述变更内容
- **描述**: 详细说明变更的原因和内容
- **关联 Issue**: 如果相关，请关联对应的 Issue
- **测试**: 说明如何测试您的变更
- **截图**: 如果是 UI 变更，请提供截图

PR 模板：
\`\`\`markdown
## 变更描述
简要描述此 PR 的变更内容。

## 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化
- [ ] 其他

## 测试
- [ ] 添加了新的测试用例
- [ ] 所有现有测试通过
- [ ] 手动测试通过

## 检查清单
- [ ] 代码符合项目规范
- [ ] 提交信息符合规范
- [ ] 文档已更新（如需要）
- [ ] 变更日志已更新（如需要）

## 关联 Issue
Closes #123

## 截图（如适用）
\`\`\`

## 代码规范

### JavaScript/TypeScript

- 使用 ESLint 和 Prettier
- 遵循 Airbnb 代码规范
- 使用 TypeScript 类型注解

### Python

- 遵循 PEP 8 规范
- 使用 Black 格式化代码
- 使用 Ruff 进行代码检查
- 使用类型提示

### 通用规范

- 函数和变量使用描述性命名
- 添加必要的注释和文档字符串
- 保持代码简洁和可读性
- 避免重复代码

## 测试指南

### 测试类型

- **单元测试**: 测试单个函数或类
- **集成测试**: 测试组件间的交互
- **端到端测试**: 测试完整的用户流程

### 测试规范

- 测试文件命名: `*.test.js` 或 `test_*.py`
- 测试函数命名: 描述性的测试名称
- 测试覆盖率: 新代码覆盖率不低于 80%

### 运行测试

\`\`\`bash
# 运行所有测试
npm test
pytest

# 运行特定测试
npm test -- --grep "feature name"
pytest tests/test_specific.py

# 生成覆盖率报告
npm run test:coverage
pytest --cov=src tests/
\`\`\`

## 文档贡献

### 文档类型

- **API 文档**: 函数和类的详细说明
- **用户指南**: 面向最终用户的使用说明
- **开发文档**: 面向开发者的技术文档

### 文档规范

- 使用 Markdown 格式
- 提供代码示例
- 保持内容准确和最新
- 使用清晰的标题结构

## 发布流程

项目维护者负责版本发布：

1. 更新版本号
2. 更新 CHANGELOG.md
3. 创建 Git 标签
4. 发布到包管理器
5. 创建 GitHub Release

## 获得帮助

如果您在贡献过程中遇到问题：

- 查看现有的 Issues 和 Discussions
- 在 Discussions 中提问
- 发送邮件到 maintainers@example.com

## 致谢

感谢所有贡献者的努力！您的贡献让这个项目变得更好。

## 许可证

通过贡献代码，您同意您的贡献将在与项目相同的许可证下发布。
```

## CHANGELOG.md 模板

```markdown
# 更新日志

本文档记录了项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 新增
- 即将发布的新功能

### 变更
- 即将发布的变更

### 修复
- 即将发布的修复

## [1.2.0] - 2025-01-23

### 新增
- 添加用户认证功能
- 支持多语言界面
- 新增 API 限流机制
- 添加数据导出功能

### 变更
- 优化数据库查询性能
- 更新 UI 设计风格
- 改进错误处理机制

### 修复
- 修复登录页面重定向问题
- 解决文件上传大小限制问题
- 修复移动端显示异常

### 安全
- 更新依赖包以修复安全漏洞
- 加强 API 输入验证

## [1.1.0] - 2025-01-15

### 新增
- 添加搜索功能
- 支持批量操作
- 新增用户权限管理

### 变更
- 优化首页加载速度
- 改进响应式设计

### 修复
- 修复数据同步问题
- 解决浏览器兼容性问题

### 废弃
- 旧版 API v1 将在下个版本中移除

## [1.0.1] - 2025-01-10

### 修复
- 修复安装脚本错误
- 解决配置文件读取问题
- 修复文档链接错误

## [1.0.0] - 2025-01-01

### 新增
- 初始版本发布
- 基础功能实现
- 用户管理系统
- RESTful API
- 响应式 Web 界面
- 完整的文档

[未发布]: https://github.com/username/repo/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/username/repo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/username/repo/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/username/repo/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/username/repo/releases/tag/v1.0.0
```

## API 文档模板

### OpenAPI 规范模板

```yaml
openapi: 3.0.3
info:
  title: 项目 API
  description: |
    项目的 RESTful API 文档
    
    ## 认证
    
    API 使用 Bearer Token 认证：
    ```
    Authorization: Bearer <your-token>
    ```
    
    ## 错误处理
    
    API 使用标准 HTTP 状态码，错误响应格式：
    ```json
    {
      "error": {
        "code": "ERROR_CODE",
        "message": "错误描述",
        "details": {}
      }
    }
    ```
    
  version: 1.0.0
  contact:
    name: API 支持
    email: api-support@example.com
    url: https://docs.example.com
  license:
    name: MIT
    url: https://opensource.org/licenses/MIT

servers:
  - url: https://api.example.com/v1
    description: 生产环境
  - url: https://staging-api.example.com/v1
    description: 测试环境
  - url: http://localhost:3000/v1
    description: 开发环境

security:
  - bearerAuth: []

paths:
  /users:
    get:
      summary: 获取用户列表
      description: 分页获取用户列表，支持搜索和过滤
      tags:
        - Users
      parameters:
        - name: page
          in: query
          description: 页码，从 1 开始
          required: false
          schema:
            type: integer
            minimum: 1
            default: 1
        - name: limit
          in: query
          description: 每页数量
          required: false
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 20
        - name: search
          in: query
          description: 搜索关键词
          required: false
          schema:
            type: string
        - name: role
          in: query
          description: 用户角色过滤
          required: false
          schema:
            type: string
            enum: [admin, user, guest]
      responses:
        '200':
          description: 成功返回用户列表
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
                  pagination:
                    $ref: '#/components/schemas/Pagination'
              examples:
                success:
                  summary: 成功示例
                  value:
                    data:
                      - id: 1
                        name: "张三"
                        email: "zhangsan@example.com"
                        role: "user"
                        createdAt: "2025-01-01T00:00:00Z"
                    pagination:
                      page: 1
                      limit: 20
                      total: 100
                      pages: 5
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/InternalError'
    
    post:
      summary: 创建用户
      description: 创建新用户账户
      tags:
        - Users
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
            examples:
              user:
                summary: 普通用户
                value:
                  name: "李四"
                  email: "lisi@example.com"
                  password: "securePassword123"
                  role: "user"
      responses:
        '201':
          description: 用户创建成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '400':
          $ref: '#/components/responses/BadRequest'
        '409':
          description: 用户已存在
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Error'

  /users/{id}:
    get:
      summary: 获取用户详情
      description: 根据用户 ID 获取用户详细信息
      tags:
        - Users
      parameters:
        - name: id
          in: path
          required: true
          description: 用户 ID
          schema:
            type: integer
      responses:
        '200':
          description: 成功返回用户信息
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          $ref: '#/components/responses/NotFound'

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          description: 用户唯一标识
          example: 1
        name:
          type: string
          description: 用户姓名
          example: "张三"
        email:
          type: string
          format: email
          description: 邮箱地址
          example: "zhangsan@example.com"
        role:
          type: string
          enum: [admin, user, guest]
          description: 用户角色
          example: "user"
        createdAt:
          type: string
          format: date-time
          description: 创建时间
          example: "2025-01-01T00:00:00Z"
        updatedAt:
          type: string
          format: date-time
          description: 更新时间
          example: "2025-01-01T00:00:00Z"
      required:
        - id
        - name
        - email
        - role
        - createdAt

    CreateUserRequest:
      type: object
      properties:
        name:
          type: string
          minLength: 2
          maxLength: 50
          description: 用户姓名
          example: "李四"
        email:
          type: string
          format: email
          description: 邮箱地址
          example: "lisi@example.com"
        password:
          type: string
          minLength: 8
          description: 密码（至少8位）
          example: "securePassword123"
        role:
          type: string
          enum: [user, admin]
          default: user
          description: 用户角色
          example: "user"
      required:
        - name
        - email
        - password

    Pagination:
      type: object
      properties:
        page:
          type: integer
          description: 当前页码
          example: 1
        limit:
          type: integer
          description: 每页数量
          example: 20
        total:
          type: integer
          description: 总记录数
          example: 100
        pages:
          type: integer
          description: 总页数
          example: 5
      required:
        - page
        - limit
        - total
        - pages

    Error:
      type: object
      properties:
        error:
          type: object
          properties:
            code:
              type: string
              description: 错误代码
              example: "VALIDATION_ERROR"
            message:
              type: string
              description: 错误描述
              example: "请求参数验证失败"
            details:
              type: object
              description: 错误详情
              example:
                field: "email"
                reason: "邮箱格式不正确"
          required:
            - code
            - message

  responses:
    BadRequest:
      description: 请求参数错误
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error:
              code: "VALIDATION_ERROR"
              message: "请求参数验证失败"
              details:
                field: "email"
                reason: "邮箱格式不正确"

    Unauthorized:
      description: 未授权访问
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error:
              code: "UNAUTHORIZED"
              message: "访问令牌无效或已过期"

    NotFound:
      description: 资源不存在
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error:
              code: "NOT_FOUND"
              message: "请求的资源不存在"

    InternalError:
      description: 服务器内部错误
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          example:
            error:
              code: "INTERNAL_ERROR"
              message: "服务器内部错误，请稍后重试"

tags:
  - name: Users
    description: 用户管理相关接口
  - name: Auth
    description: 认证相关接口
```

## 架构文档模板

### 系统架构概览

```markdown
# 系统架构概览

## 架构图

```mermaid
graph TB
    Client[客户端] --> LB[负载均衡器]
    LB --> API[API 网关]
    API --> Auth[认证服务]
    API --> UserService[用户服务]
    API --> OrderService[订单服务]
    
    UserService --> UserDB[(用户数据库)]
    OrderService --> OrderDB[(订单数据库)]
    
    UserService --> Cache[Redis 缓存]
    OrderService --> Cache
    
    UserService --> MQ[消息队列]
    OrderService --> MQ
```

## 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **状态管理**: Zustand
- **UI 组件**: Ant Design
- **构建工具**: Vite
- **样式**: Tailwind CSS

### 后端
- **框架**: FastAPI + Python 3.11
- **数据库**: PostgreSQL 15
- **缓存**: Redis 7
- **消息队列**: RabbitMQ
- **搜索**: Elasticsearch

### 基础设施
- **容器化**: Docker + Docker Compose
- **编排**: Kubernetes
- **监控**: Prometheus + Grafana
- **日志**: ELK Stack
- **CI/CD**: GitHub Actions

## 核心组件

### API 网关
负责请求路由、认证、限流、监控等功能。

### 认证服务
基于 JWT 的用户认证和授权系统。

### 用户服务
用户信息管理，包括注册、登录、个人资料等。

### 订单服务
订单处理流程，包括创建、支付、发货等状态管理。

## 数据流

1. 用户请求通过负载均衡器到达 API 网关
2. API 网关验证请求并路由到相应服务
3. 服务处理业务逻辑并访问数据库
4. 结果通过相同路径返回给用户

## 安全考虑

- HTTPS 加密传输
- JWT Token 认证
- API 限流防护
- 输入验证和 SQL 注入防护
- 敏感数据加密存储

## 性能优化

- Redis 缓存热点数据
- 数据库索引优化
- CDN 加速静态资源
- 异步处理耗时操作
- 连接池管理

## 扩展性设计

- 微服务架构支持水平扩展
- 数据库读写分离
- 消息队列解耦服务依赖
- 容器化部署支持弹性伸缩
```

这个项目文档管理 skill 已经创建完成！它包含了：

1. **完整的文档管理指导** - 从规划到维护的全流程
2. **标准化模板** - README、CONTRIBUTING、CHANGELOG 等
3. **最佳实践** - 文档即代码、用户导向等原则
4. **工具和技术栈** - MkDocs、Sphinx、OpenAPI 等
5. **质量保证** - 审查清单、自动化检查等

现在你可以使用关键词如 "项目文档"、"文档管理"、"documentation" 等来触发这个 skill，它会为你提供专业的文档管理指导和模板。
