# 贡献指南

## 开发环境

```bash
# 前端
cd frontend
npm install
npm run dev          # 启动开发服务器 (端口 5173)

# 后端
cd backend
pip install -r requirements.txt
uvicorn src.main:app --reload   # 启动 API 服务器 (端口 8000)
```

## Git 提交规范

```bash
feat: 新功能
fix: Bug 修复
docs: 文档更新
refactor: 重构
chore: 构建/依赖更新
```

示例：
```bash
git commit -m "feat(admin): add member export"
git commit -m "fix(frontend): resolve login error"
git commit -m "docs: update README"
```

## 代码规范

- 前端规范：`frontend/src/README.md`
- 后端规范：`backend/README.md`

## 测试

```bash
# 前端
npm run test          # 单元测试
npm run test:e2e      # E2E 测试

# 后端
pytest
```
