# GitHub 导入指南

## 步骤1: 在GitHub上创建新仓库

### 方法1: 通过GitHub网页
1. 打开 [GitHub](https://github.com)
2. 登录你的GitHub账户
3. 点击右上角的 "+" 号，选择 "New repository"
4. 填写仓库信息：
   - **Repository name**: `word-is-my-world` 或 `graduate-word-memory-tool`
   - **Description**: `考研单词趣记法快速查询工具 - Vue3 + TypeScript + Vite`
   - **Visibility**: 选择 Public 或 Private
   - **不要勾选** "Add a README file"、"Add .gitignore"、"Choose a license"
5. 点击 "Create repository"

### 方法2: 通过GitHub CLI (如果已安装)
```bash
gh repo create word-is-my-world --public --description "考研单词趣记法快速查询工具"
```

## 步骤2: 连接本地仓库到GitHub

创建仓库后，GitHub会显示一个页面，复制其中的仓库URL（类似 `https://github.com/你的用户名/word-is-my-world.git`）

## 步骤3: 执行推送命令

在项目目录中执行以下命令（请将URL替换为你的实际仓库URL）：

```bash
# 添加远程仓库
git remote add origin https://github.com/你的用户名/word-is-my-world.git

# 推送代码到GitHub
git push -u origin master
```

## 步骤4: 验证上传

1. 刷新GitHub仓库页面
2. 确认所有文件都已上传
3. 检查README.md是否正确显示

## 注意事项

- 如果遇到认证问题，可能需要设置Personal Access Token
- 首次推送可能需要输入GitHub用户名和密码/token
- 确保网络连接正常

## 项目特点

✅ Vue3 + TypeScript + Vite 技术栈  
✅ 响应式设计，支持移动端  
✅ 实时搜索功能  
✅ 一键粘贴功能  
✅ 轻量级，无需大型UI库  
✅ 纯前端静态应用，易于部署  

## 后续操作

上传成功后，你可以：
1. 在GitHub Pages上部署项目
2. 邀请其他人协作开发
3. 使用GitHub Actions进行自动化部署
4. 创建Issues和Pull Requests进行项目管理