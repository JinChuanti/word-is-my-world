# 考研单词趣记法查询工具 - 部署指南

本项目已成功构建生产版本，可以通过多种方式进行部署。

## 📦 构建结果

项目已成功构建，生成的文件位于 `dist/` 目录：

```
dist/
├── assets/
│   ├── index-CO-GWx32.css  (14.33 kB)
│   └── index-wraEq6Cl.js   (69.02 kB)
├── index.html              (0.46 kB)
├── vite.svg
└── words.json              (词汇数据文件)
```

## 🚀 部署方案

### 1. Vercel 部署（推荐）

**优势：** 免费、快速、自动部署、全球CDN

#### 方法一：通过 Vercel CLI
```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel

# 生产环境部署
vercel --prod
```

#### 方法二：通过 GitHub 集成
1. 将代码推送到 GitHub 仓库
2. 访问 [vercel.com](https://vercel.com)
3. 点击 "Import Project" 导入 GitHub 仓库
4. Vercel 会自动检测到 Vue 项目并使用正确的构建设置
5. 部署完成后会提供访问链接

**配置文件：** 项目已包含 `vercel.json` 配置文件，包含：
- 构建命令和输出目录设置
- SPA 路由重写规则
- 静态资源缓存优化

### 2. Netlify 部署

**优势：** 免费、简单、表单处理、函数支持

#### 方法一：拖拽部署
1. 访问 [netlify.com](https://netlify.com)
2. 直接将 `dist/` 文件夹拖拽到部署区域
3. 获得访问链接

#### 方法二：Git 集成
1. 将代码推送到 GitHub/GitLab
2. 在 Netlify 中连接仓库
3. 设置构建命令：`yarn build`
4. 设置发布目录：`dist`
5. 自动部署

### 3. GitHub Pages 部署

**优势：** 免费、与 GitHub 集成

#### 步骤：
1. 安装 gh-pages 包：
```bash
yarn add -D gh-pages
```

2. 在 `package.json` 中添加部署脚本：
```json
{
  "scripts": {
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://yourusername.github.io/word-is-my-world"
}
```

3. 构建并部署：
```bash
yarn build
yarn deploy
```

4. 在 GitHub 仓库设置中启用 Pages，选择 gh-pages 分支

### 4. 静态文件服务器部署

**适用于：** 自有服务器、VPS

#### Nginx 配置示例：
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;
    
    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Apache 配置（.htaccess）：
```apache
RewriteEngine On
RewriteBase /

# 处理 SPA 路由
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# 静态资源缓存
<FilesMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
    ExpiresActive On
    ExpiresDefault "access plus 1 year"
</FilesMatch>
```

### 5. 云服务商部署

#### 阿里云 OSS + CDN
1. 上传 `dist/` 内容到 OSS 存储桶
2. 开启静态网站托管
3. 配置 CDN 加速
4. 设置自定义域名

#### 腾讯云 COS + CDN
1. 上传文件到 COS 存储桶
2. 开启静态网站功能
3. 配置 CDN 分发

## 🔧 部署注意事项

### 1. 路径配置
- 项目使用相对路径，支持子目录部署
- 如需部署到子目录，修改 `vite.config.ts` 中的 `base` 配置

### 2. 数据文件
- `words.json` 文件包含所有词汇数据
- 确保部署时包含此文件
- 文件大小约 500KB，加载速度良好

### 3. 浏览器兼容性
- 支持现代浏览器（Chrome 60+, Firefox 60+, Safari 12+）
- 使用了 ES2020 语法和现代 Web API

### 4. HTTPS 要求
- 剪贴板 API 需要 HTTPS 环境
- 推荐使用支持 HTTPS 的部署平台

## 📊 性能优化

已实现的优化：
- ✅ 代码分割和懒加载
- ✅ 静态资源压缩
- ✅ Gzip 压缩
- ✅ 缓存策略配置
- ✅ 图片和字体优化

## 🎯 推荐部署方案

**开发测试：** Vercel（快速预览）
**生产环境：** Vercel 或 Netlify（稳定可靠）
**企业部署：** 自有服务器 + CDN

## 📞 技术支持

如遇到部署问题，请检查：
1. 构建是否成功（`yarn build`）
2. `dist/` 目录是否完整
3. 服务器是否支持 SPA 路由
4. HTTPS 是否正确配置

---

**部署完成后，您的考研单词趣记法查询工具就可以在线使用了！** 🎉