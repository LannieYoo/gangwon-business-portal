#!/usr/bin/env node

/**
 * 文档服务器脚本
 * 启动本地文档服务器用于预览
 */

const fs = require('fs');
const path = require('path');
const http = require('http');
const { execSync } = require('child_process');

class DocumentServer {
  constructor() {
    this.projectRoot = process.cwd();
    this.docsDir = path.join(this.projectRoot, 'docs');
    this.port = process.env.DOCS_PORT || 8080;
  }

  async serve() {
    console.log('📚 启动文档服务器...');
    
    try {
      // 检查是否有 MkDocs 配置
      if (fs.existsSync('mkdocs.yml')) {
        await this.serveMkDocs();
      } else {
        await this.serveSimple();
      }
    } catch (error) {
      console.error('❌ 启动文档服务器失败:', error.message);
      process.exit(1);
    }
  }

  async serveMkDocs() {
    console.log('🔧 检测到 MkDocs 配置，使用 MkDocs 服务器...');
    
    try {
      // 检查 MkDocs 是否安装
      execSync('mkdocs --version', { stdio: 'ignore' });
      
      console.log(`🌐 MkDocs 服务器启动在 http://localhost:${this.port}`);
      console.log('按 Ctrl+C 停止服务器');
      
      // 启动 MkDocs 服务器
      execSync(`mkdocs serve --dev-addr=localhost:${this.port}`, { 
        stdio: 'inherit',
        cwd: this.projectRoot 
      });
      
    } catch (error) {
      console.warn('⚠️ MkDocs 未安装或启动失败，使用简单服务器...');
      await this.serveSimple();
    }
  }

  async serveSimple() {
    console.log('🚀 启动简单文档服务器...');
    
    const server = http.createServer((req, res) => {
      this.handleRequest(req, res);
    });
    
    server.listen(this.port, () => {
      console.log(`🌐 文档服务器启动在 http://localhost:${this.port}`);
      console.log('按 Ctrl+C 停止服务器');
      console.log('\n📖 可用页面:');
      console.log(`  - http://localhost:${this.port}/ (README)`);
      console.log(`  - http://localhost:${this.port}/docs/ (文档目录)`);
      console.log(`  - http://localhost:${this.port}/docs/codemaps/ (代码地图)`);
    });
    
    // 优雅关闭
    process.on('SIGINT', () => {
      console.log('\n👋 关闭文档服务器...');
      server.close(() => {
        process.exit(0);
      });
    });
  }

  handleRequest(req, res) {
    let filePath = this.getFilePath(req.url);
    
    // 检查文件是否存在
    if (!fs.existsSync(filePath)) {
      this.send404(res, req.url);
      return;
    }
    
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // 尝试查找索引文件
      const indexFiles = ['index.html', 'README.md', 'index.md'];
      let indexFile = null;
      
      for (const index of indexFiles) {
        const indexPath = path.join(filePath, index);
        if (fs.existsSync(indexPath)) {
          indexFile = indexPath;
          break;
        }
      }
      
      if (indexFile) {
        filePath = indexFile;
      } else {
        this.sendDirectoryListing(res, filePath, req.url);
        return;
      }
    }
    
    this.sendFile(res, filePath);
  }

  getFilePath(url) {
    // 清理 URL
    let cleanUrl = url.split('?')[0]; // 移除查询参数
    cleanUrl = decodeURIComponent(cleanUrl);
    
    // 防止路径遍历攻击
    if (cleanUrl.includes('..')) {
      cleanUrl = '/';
    }
    
    // 根路径映射到 README.md
    if (cleanUrl === '/') {
      return path.join(this.projectRoot, 'README.md');
    }
    
    // 其他路径
    return path.join(this.projectRoot, cleanUrl);
  }

  sendFile(res, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = this.getContentType(ext);
    
    try {
      if (ext === '.md') {
        // 渲染 Markdown
        const content = fs.readFileSync(filePath, 'utf8');
        const html = this.renderMarkdown(content, filePath);
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(html);
      } else {
        // 直接发送文件
        const content = fs.readFileSync(filePath);
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
      }
    } catch (error) {
      this.send500(res, error.message);
    }
  }

  getContentType(ext) {
    const types = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.ico': 'image/x-icon'
    };
    
    return types[ext] || 'text/plain';
  }

  renderMarkdown(content, filePath) {
    // 简单的 Markdown 渲染
    let html = content
      // 标题
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // 代码块
      .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      // 行内代码
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // 链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      // 粗体
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // 斜体
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // 列表
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      // 段落
      .replace(/\n\n/g, '</p><p>')
      .replace(/^(?!<[h|u|p|c])(.+)$/gm, '<p>$1</p>');
    
    // 包装在 HTML 模板中
    return this.wrapInTemplate(html, filePath);
  }

  wrapInTemplate(content, filePath) {
    const title = this.extractTitle(content) || path.basename(filePath, '.md');
    
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - 项目文档</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
        }
        h1, h2, h3 { color: #2c3e50; }
        h1 { border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        h2 { border-bottom: 1px solid #ecf0f1; padding-bottom: 5px; }
        code {
            background: #f8f9fa;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Monaco', 'Consolas', monospace;
        }
        pre {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            border-left: 4px solid #3498db;
        }
        pre code {
            background: none;
            padding: 0;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 15px 0;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px 12px;
            text-align: left;
        }
        th {
            background: #f8f9fa;
            font-weight: 600;
        }
        a {
            color: #3498db;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        ul, ol {
            padding-left: 20px;
        }
        .nav {
            background: #f8f9fa;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .nav a {
            margin-right: 15px;
        }
    </style>
</head>
<body>
    <div class="nav">
        <a href="/">首页</a>
        <a href="/docs/">文档</a>
        <a href="/docs/codemaps/">代码地图</a>
        <a href="/docs/guides/">指南</a>
    </div>
    ${content}
    <hr>
    <footer style="text-align: center; color: #666; font-size: 0.9em;">
        <p>由 serve-docs.js 提供 - <a href="http://localhost:${this.port}">返回首页</a></p>
    </footer>
</body>
</html>`;
  }

  extractTitle(html) {
    const match = html.match(/<h1>(.*?)<\/h1>/);
    return match ? match[1] : null;
  }

  sendDirectoryListing(res, dirPath, url) {
    try {
      const items = fs.readdirSync(dirPath);
      const files = [];
      const dirs = [];
      
      items.forEach(item => {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          dirs.push(item);
        } else {
          files.push(item);
        }
      });
      
      let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>目录列表 - ${url}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; }
        ul { list-style: none; padding: 0; }
        li { margin: 5px 0; }
        a { text-decoration: none; color: #0066cc; }
        a:hover { text-decoration: underline; }
        .dir { font-weight: bold; }
        .file { color: #666; }
    </style>
</head>
<body>
    <h1>目录: ${url}</h1>
    <ul>`;
      
      if (url !== '/') {
        html += '<li><a href="../" class="dir">📁 ../</a></li>';
      }
      
      dirs.sort().forEach(dir => {
        html += `<li><a href="${url}${url.endsWith('/') ? '' : '/'}${dir}/" class="dir">📁 ${dir}/</a></li>`;
      });
      
      files.sort().forEach(file => {
        const icon = file.endsWith('.md') ? '📄' : '📋';
        html += `<li><a href="${url}${url.endsWith('/') ? '' : '/'}${file}" class="file">${icon} ${file}</a></li>`;
      });
      
      html += `    </ul>
</body>
</html>`;
      
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
      
    } catch (error) {
      this.send500(res, error.message);
    }
  }

  send404(res, url) {
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>404 - 页面未找到</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
        h1 { color: #e74c3c; }
    </style>
</head>
<body>
    <h1>404 - 页面未找到</h1>
    <p>请求的页面 <code>${url}</code> 不存在。</p>
    <p><a href="/">返回首页</a></p>
</body>
</html>`;
    
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }

  send500(res, error) {
    const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>500 - 服务器错误</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
        h1 { color: #e74c3c; }
    </style>
</head>
<body>
    <h1>500 - 服务器错误</h1>
    <p>服务器处理请求时发生错误。</p>
    <p><code>${error}</code></p>
    <p><a href="/">返回首页</a></p>
</body>
</html>`;
    
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  }
}

// 主执行逻辑
if (require.main === module) {
  const server = new DocumentServer();
  server.serve().catch(error => {
    console.error('启动失败:', error);
    process.exit(1);
  });
}

module.exports = DocumentServer;
