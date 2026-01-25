// 单词数据类型定义
export interface WordData {
  word: string;           // 单词
  definition: string;     // 中文释义
  mnemonic_type: string;  // 记忆类型
  mnemonic_content: string; // 趣味记忆法内容
  example_sentence: string; // 例句
  sentence_translation: string; // 例句翻译
}

// 搜索结果类型定义
export interface SearchResult {
  found: boolean;
  data?: WordData;
  suggestions?: WordData[]; // 近似搜索建议
}