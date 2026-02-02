# Service 重构 - 故障排除

## 问题：404 错误 - /api/content/banners

### 症状
浏览器日志显示请求 `/api/content/banners` 返回 404 错误。

### 原因
这是**浏览器缓存**问题。代码已经更新为正确的路径 `/api/banners`，但浏览器仍在使用旧的缓存文件。

### 解决方案

#### 方案 1: 硬刷新浏览器（推荐）

**Windows/Linux**:
```
Ctrl + Shift + R
或
Ctrl + F5
```

**Mac**:
```
Cmd + Shift + R
```

#### 方案 2: 清除浏览器缓存

1. 打开浏览器开发者工具 (F12)
2. 右键点击刷新按钮
3. 选择 "清空缓存并硬性重新加载"

#### 方案 3: 重启开发服务器

```powershell
# 停止前端开发服务器 (Ctrl + C)
# 然后重新启动
cd frontend
npm run dev
```

#### 方案 4: 清除 Vite 缓存

```powershell
cd frontend
Remove-Item -Recurse -Force node_modules/.vite
npm run dev
```

### 验证修复

打开浏览器开发者工具的 Network 标签，刷新页面，应该看到：

✅ **正确**: `GET /api/banners?bannerType=main_primary` → 200 OK
❌ **错误**: `GET /api/content/banners?bannerType=main_primary` → 404 Not Found

### 代码确认

已确认代码中的路径是正确的：

```javascript
// frontend/src/shared/services/content.service.js
async getBanners(params) {
  return await apiService.get(`${API_PREFIX}/banners`, params);  // ✅ 正确
}
```

没有任何地方使用 `/content/banners` 路径。

### 如果问题仍然存在

1. 检查是否有多个浏览器标签页打开
2. 关闭所有标签页，重新打开
3. 尝试使用无痕/隐私模式
4. 检查浏览器扩展是否干扰（禁用所有扩展）

### 预期结果

修复后，所有页面的横幅应该正常显示，不再有 404 错误。
