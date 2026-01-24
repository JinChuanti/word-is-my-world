# EdgeOne Pages 部署指南

本指南将帮助你将项目（包括前端和后端 API）一键部署到 **腾讯云 EdgeOne Pages**。这是目前最推荐的部署方式，因为它：
1. **完全免费**（在基础额度内）。
2. **速度极快**（利用腾讯云全球边缘节点）。
3. **部署简单**（只需连接 GitHub，无需手动创建函数）。
4. **前后端一体**（自动处理跨域和 API 路由）。

## 1. 准备工作

确保你的代码已经推送到 GitHub 仓库。

本项目已经为你配置好了 EdgeOne Pages 所需的目录结构：
- 前端代码：`src/` (Vue)
- 后端函数：`functions/api/recognize.js` (EdgeOne Pages Functions)

## 2. 创建 EdgeOne Pages 项目

1. 登录 [腾讯云 EdgeOne 控制台](https://console.cloud.tencent.com/edgeone/pages)。
2. 点击 **新建项目**。
3. 选择 **连接 Git 代码仓库** (Connect to Git)。
4. 授权并选择你的 `word-is-my-world` 仓库。

## 3. 配置构建设置

在 "构建配置" (Build Settings) 步骤中，EdgeOne Pages 通常会自动检测到这是一个 Vite 项目，但请核对以下信息：

- **框架预设 (Framework Preset)**: `Vite` (如果没识别出来，请手动选择)
- **构建命令 (Build Command)**: `npm run build`
- **输出目录 (Output Directory)**: `dist`

## 4. 配置环境变量 (关键步骤)

为了让后端 API 能够调用腾讯云语音识别服务，你必须配置环境变量。

在部署界面的 **Environment Variables** (环境变量) 区域，添加以下变量：

| Key (键) | Value (值) | 说明 |
| --- | --- | --- |
| `TENCENT_SECRET_ID` | `你的SecretId` | 替换为你的真实 SecretId |
| `TENCENT_SECRET_KEY` | `你的SecretKey` | 替换为你的真实 SecretKey |

> 注意：不要将这些密钥提交到代码仓库中，只能在 EdgeOne 控制台配置。

## 5. 部署

点击 **Deploy** (部署) 按钮。

EdgeOne Pages 会自动：
1. 安装依赖。
2. 构建前端 (`npm run build`)。
3. 部署 `functions/` 目录下的后端函数。
4. 分发到全球边缘节点。

## 6. 验证

部署完成后，EdgeOne 会提供一个访问域名（例如 `your-project.pages.edgeone.ai`）。

1. 打开该链接。
2. 点击麦克风按钮说话。
3. 系统会自动调用 `/api/recognize` 接口（该接口现在由 EdgeOne Pages Function 托管）。
4. 你应该能看到识别结果，且速度非常快。

## 常见问题

**Q: 为什么不需要配置 VITE_API_URL？**
A: 因为 EdgeOne Pages 将前端和后端部署在同一个域名下。前端请求 `/api/recognize` 会自动路由到同域名的后端函数，无需跨域，也无需配置绝对路径。

**Q: 我在哪里查看函数日志？**
A: 在 EdgeOne Pages 项目详情页的 "Functions" (函数) 选项卡中可以查看调用日志。

**Q: 遇到构建失败怎么办？**
A: 检查 `package.json` 中的依赖是否正确，或者查看构建日志中的报错信息。确保没有上传 `node_modules` 到 GitHub。
