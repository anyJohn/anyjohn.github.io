---
title: Agent 记忆架构：Markdown vs RAG (Symbolic vs Semantic)
date: 2026-07-12
author: AnyJohn
tags:
  - 架构设计
  - 记忆系统
  - RAG
  - any-code
---

# Agent 记忆架构：Markdown 与 RAG 的博弈与融合

在构建 Agent 时，最核心的问题之一是：**Agent 如何记住信息？**
目前的流派主要分为两派：**基于文件的 Markdown 记忆**（Symbolic Memory）和 **基于向量数据库的 RAG 记忆**（Semantic Memory）。

很多人问"哪种更好"，答案是：**它们在 Agent 的大脑中扮演完全不同的角色。优秀的 Agent 架构从不二选一，而是融合两者。**

---

## 1. 核心对比：符号记忆 vs 语义记忆

| 维度 | Markdown 记忆 (Symbolic) | RAG 记忆 (Semantic) |
|:---|:---|:---|
| **本质** | **文件系统** (文本、结构、规则) | **向量空间** (高维 Embeddings) |
| **检索方式** | 精确匹配 (grep/glob)、全文读取 | 语义相似度 (Cosine Similarity) |
| **优势** | ✅ **100% 精确**：说什么就是什么<br>✅ **可解释性极强**：确定读了哪行<br>✅ **Token 效率**：按需加载，不塞废话 | ✅ **泛化能力强**：搜"登录报错"能匹配"Auth Failed"<br>✅ **海量扩展**：轻松处理 10 万行代码<br>✅ **维护成本低**：自动索引，无需人写 |
| **劣势** | ❌ **语义僵化**：搜"apple"找不到"iPhone"<br>❌ **规模瓶颈**：文件太大，读取慢且浪费 Context | ❌ **不可控**：可能检索到"看似相关实则错误"的信息<br>❌ **规则稀释**：硬性约束容易在相似度计算中被忽略 |
| **适用场景** | **System Prompt、规则、当前状态** | **代码库索引、文档库、历史经验** |

---

## 2. 为什么"单纯的 RAG"往往表现不佳？

2023 年流行的"Naive RAG"（不管问什么，先去向量库搜 5 个 chunk 塞进 Prompt）正在被淘汰，原因有二：

1.  **上下文窗口的爆发**：现在的模型（Gemini 1.5, Claude 3.5）能处理百万级 Token。对于中小型知识库，直接把整个文件喂给模型（Long Context）比切片检索更准、更全。
2.  **规则不能靠"相似度"维持**：
    *   如果规定"严禁使用 `any` 类型"，这是一个**绝对指令**。
    *   如果这条规则存在向量库里，Agent 在写代码时可能因为"当前代码与违规示例不相似"而忽略了这条规则。
    *   **结论：底线规则必须是 Deterministic（确定性）的，不能模糊。**

---

## 3. 终极方案：分层混合记忆架构 (Hybrid Memory)

参考 Claude Code、RelayAgent 以及 OpenClaw 等先进架构，工业级 Agent 通常采用 **三层记忆模型**：

### 第一层：规则与约束层 (Rules & Constraints) —— **Markdown**
*   **载体**：`.anycode/rules.md` 或直接注入 System Prompt。
*   **机制**：**全局加载 (Global Injection)**。
*   **内容**：技术栈限制（如 "Must use TypeScript"）、代码风格、安全红线。
*   **特点**：每次请求**必须**在场，不可丢失，精确控制 Agent 的行为边界。

### 第二层：工作记忆层 (Working Memory) —— **Markdown / JSON**
*   **载体**：`.anycode/memory.md` 或 `session.json`。
*   **机制**：**动态读写 (Active R/W)**。
*   **内容**：当前任务的进度、刚才犯的错误、用户的临时指令（"记住这个变量叫 `userId`"）。
*   **特点**：Agent 自己在对话过程中维护。类似于人类的"短期记忆"。随着对话变长，需要定期压缩（Summarization）。

### 第三层：语义知识层 (Semantic Knowledge) —— **RAG / Vector DB**
*   **载体**：`sqlite-vec` / `ChromaDB` (Python Microservice)。
*   **机制**：**惰性加载 (Lazy Loading / On-Demand)**。
*   **内容**：项目代码库 (AST 索引)、长篇开发文档、历史相似 Bug 的修复方案。
*   **特点**：只有在 Agent 觉得"我不知道"或"需要参考资料"时才触发。**这是 Agent 的"外挂硬盘"。**

---

## 4. `any-code` 的演进路线

在你的 `any-code` 项目中，建议按以下阶段落地，这也是面试时的绝佳故事线：

*   **Phase 1 (MVP)**：**全 Markdown 架构**。
    *   利用 `Skill` 目录存放知识，通过 `grep`/`glob` 检索。
    *   **优势**：开发极快，延迟最低，适合个人开发者工具。
    *   *话术*："在早期，我优先保证低延迟和 100% 的规则遵从度，利用结构化的 Markdown 配合全文检索满足了 80% 的场景。"

*   **Phase 2 (进阶)**：**引入 Python RAG 微服务**。
    *   当代码库变大，关键词搜索失效时，启用 RAG 工具。
    *   Agent 自主决定何时调用 `knowledge_search`。
    *   **优势**：具备语义理解能力，能处理复杂的"非结构化"查询（如："找出所有处理支付超时的逻辑"）。
    *   *话术*："随着知识库扩大，单纯的全文检索遇到了语义瓶颈。我设计了一个基于 `sqlite-vec` 的异构微服务，实现了从'关键词匹配'到'语义理解'的跨越，同时保持核心 Agent 循环的 TS 类型安全。"

---

## 5. 总结：从 Naive RAG 到 Intelligent Retrieval

RAG 并没有死，死的是“无脑检索”。

在 `any-code` 中，我们没有把 RAG 写成硬编码的 Pipeline，而是把它做成了 Agent 的一个 **Tool**。
Agent 会根据用户的意图（Intent），**自主决定**是否需要检索、检索什么范围（Scope）、以及使用什么策略（Strategy）。

这就是 **Intelligent Retrieval** —— 让检索成为 Agent 思考的一部分，而不是前置的流水线。
