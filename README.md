# 考研单词趣记法查询工具

一个轻量级、响应极速的纯前端Web应用，专为备战考研的中国大学生设计。提供谐音、联想、词根词缀等趣味记忆技巧的快速查询功能。

## 功能特点

- 🔍 实时搜索单词，瞬时响应
- 📋 一键粘贴剪贴板内容
- 🎯 精确匹配查找
- 💡 趣味记忆法展示
- 📱 响应式设计，支持平板设备

## 技术栈

- Vue 3 + TypeScript
- Vite
- 原生CSS
- 纯前端静态应用

## 本地开发

### 安装依赖

```bash
yarn install
```

### 启动开发服务器

```bash
yarn dev
```

### 构建生产版本

```bash
yarn build
```

## 项目结构

```
src/
├── components/          # Vue组件
│   ├── SearchBox.vue   # 搜索框组件
│   ├── PasteButton.vue # 粘贴按钮组件
│   └── ResultDisplay.vue # 结果展示组件
├── composables/         # 组合式函数
│   ├── useWordSearch.ts # 搜索逻辑
│   └── useClipboard.ts  # 剪贴板操作
├── types/              # 类型定义
│   └── word.ts         # 单词数据类型
├── App.vue             # 主应用组件
└── main.ts             # 应用入口
```

## 数据格式

单词数据存储在 `public/words.json` 文件中，格式如下：

```json
{
  "word": "abandon",
  "definition": "v. 放弃, 抛弃",
  "mnemonic_type": "词根词缀",
  "mnemonic_content": "词根记忆法内容...",
  "example_sentence": "例句及翻译"
}
```