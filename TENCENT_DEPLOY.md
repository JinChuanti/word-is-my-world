# 腾讯云部署指南 (Backend on SCF)

由于 Vercel 在国内访问速度较慢，为了获得最佳的语音识别体验，建议将后端服务部署到**腾讯云云函数 (SCF)**，并将前端静态资源部署到 **腾讯云 Webify** 或 **EdgeOne Pages**。

## 1. 准备工作

确保你已经拥有腾讯云账号，并开通了：
- 云函数 (SCF)
- API 网关

## 2. 部署后端 (云函数 SCF)

### 步骤 A: 准备代码包
1. 进入项目根目录下的 `serverless` 文件夹。
2. 确保包含以下文件：
   - `tencent_scf.js` (核心逻辑代码)
   - `package.json` (依赖定义)

### 步骤 B: 创建云函数
1. 登录 [腾讯云 SCF 控制台](https://console.cloud.tencent.com/scf/list)。
2. 点击 **新建**，选择 **从头开始**。
   - **函数名称**: `word-asr-proxy` (或其他你喜欢的名字)
   - **运行环境**: `Nodejs 16.13` 或更高版本
3. **函数代码**:
   - 提交方法: **本地上传文件夹**
   - 选择上传本项目中的 `serverless` 文件夹。
4. **高级配置** -> **执行配置**:
   - **执行方法**: 修改为 `tencent_scf.main_handler` (注意：默认是 `index.main_handler`，必须修改！)
5. **环境变量**:
   添加以下两个环境变量（值与之前提供给 Vercel 的一致）：
   - `TENCENT_SECRET_ID`: 你的 SecretId
   - `TENCENT_SECRET_KEY`: 你的 SecretKey
6. 点击 **完成**。

### 步骤 C: 安装依赖
1. 函数创建成功后，进入 **函数代码** 标签页。
2. 在终端（或编辑器下方）找到并点击 **终端** -> **新终端**，或者直接在代码编辑界面寻找 **安装依赖** 按钮（如果有）。
3. 如果没有在线安装按钮，你需要先在本地 `serverless` 目录下运行 `npm install`，生成 `node_modules` 文件夹，然后将整个文件夹（包含 `node_modules`）打包成 zip 上传。
   *(推荐方式：在本地 `serverless` 目录下执行 `npm install`，然后将该目录下的所有文件压缩为 `scf_deploy.zip`，在控制台选择上传 zip 包)*

### 步骤 D: 配置触发器 (API 网关)
1. 在函数详情页，点击 **触发管理** -> **创建触发器**。
2. **触发方式**: `API 网关触发`。
3. **API 服务类型**: `新建 API 服务`。
4. **请求方法**: `ANY` (或 `POST` 和 `OPTIONS`)。
5. **启用集成响应**: **勾选** (非常重要，否则 CORS 设置可能不生效)。
6. 点击 **提交**。
7. 复制生成的 **访问路径** (例如 `https://service-xxxxxx.sh.apigw.tencentcs.com/release/word-asr-proxy`)。这是你的 **后端 API 地址**。

## 3. 配置前端

### 方法一：本地构建 (推荐)

如果你是手动构建并上传到 EdgeOne/Webify：

1. 在项目根目录创建或修改 `.env.production` 文件：
   ```env
   VITE_API_URL=你的云函数API网关地址
   ```
   *(例如: `VITE_API_URL=https://service-xxxxxx.sh.apigw.tencentcs.com/release/word-asr-proxy`)*

2. 重新构建项目：
   ```bash
   npm run build
   ```

3. 将生成的 `dist` 文件夹上传到腾讯云 EdgeOne Pages 或 Webify。

### 方法二：EdgeOne / Webify 自动构建

如果你在 EdgeOne Pages 中连接了 GitHub 仓库进行自动构建：

1. 进入 EdgeOne Pages 控制台。
2. 找到你的项目设置 -> **环境变量**。
3. 添加变量：
   - Key: `VITE_API_URL`
   - Value: `你的云函数API网关地址`
4. 触发重新部署 (Redeploy)。

## 4. 验证

1. 打开你的线上网站。
2. 按 F12 打开开发者工具，切换到 Network 面板。
3. 尝试使用语音识别。
4. 观察请求地址是否变成了你配置的腾讯云 API 地址，而不是 `.vercel.app`。
