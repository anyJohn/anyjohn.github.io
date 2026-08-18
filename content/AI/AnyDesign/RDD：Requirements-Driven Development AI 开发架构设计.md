# RDD：Requirements-Driven Development AI 开发架构设计

## 1. 摘要

RDD（Requirements-Driven Development，需求驱动开发）是一套面向 AI Agent 软件工程的开发架构。

RDD 的核心目标不是让 LLM 更快地生成代码，而是建立一条从**人类意图到可靠软件实现**的完整需求收敛链路：

```text
Human Intent
    ↓
Requirement Engineering
    ↓
Specification Engineering
    ↓
Test Engineering
    ↓
Implementation
    ↓
Verification
```

RDD 认为，软件开发中最重要的问题并不是“如何生成代码”，而是：

> 如何将一个最初模糊、不完整、存在歧义的人类需求，逐步转换成明确、可验证、可执行的软件规格，并最终形成正确的代码。

因此，RDD 将 AI Agent 的主要工作划分为三个核心工程阶段：

- **Requirement Engineering（需求工程）**：确定为什么做、做什么、需求边界在哪里。
- **Specification Engineering（规格工程）**：确定系统必须表现出什么行为，以及必须满足什么约束。
- **Test Engineering（测试工程）**：确定如何证明 Specification 被正确实现。

最终由 Implementation Agent 根据已经确定的 Specification 完成代码实现。

RDD 的基本原则是：

> **Requirement defines intent，Specification defines behavior，Test defines evidence，Code realizes the specification。**

---

# 2. RDD 要解决的问题

传统 AI Coding 通常采用：

```text
Prompt
  ↓
LLM
  ↓
Code
```

这种模式的问题在于，Prompt 往往同时承担了：

- 需求描述
- 产品设计
- 架构设计
- 行为定义
- 边界条件
- 验收标准
- 实现指导

这会导致 Agent 必须自行补全大量信息。

例如：

```text
“给 SubAgent 增加 Workspace。”
```

对于人类来说可能已经足够作为一个讨论起点，但对于工程实现来说，它至少缺少：

- Workspace 是什么？
- 谁创建？
- 生命周期是什么？
- 谁拥有？
- 是否隔离？
- 是否共享？
- 如何持久化？
- Task 完成后是否删除？
- 多个 Agent 是否可以同时访问？
- 失败时如何恢复？
- 什么行为才算实现完成？

如果这些问题由不同 Agent 自己猜测，最终得到的代码虽然可能“能运行”，却未必实现了用户真正想要的系统。

RDD 因此将开发过程从：

```text
Prompt → Code
```

改变为：

```text
Intent
  ↓
Requirement
  ↓
Specification
  ↓
Test
  ↓
Code
```

---

# 3. RDD 的核心思想：逐级降低不确定性

RDD 将软件开发视为一个不断降低需求不确定性的过程。

```text
模糊愿景
   ↓
Raw Requirement / Epic
   ↓
Feature
   ↓
Story
   ↓
Specification
   ↓
Acceptance Criteria
   ↓
Test
   ↓
Implementation
   ↓
Code
```

每一个阶段都应该比前一个阶段更加明确。

因此：

> **RDD 不是文档驱动开发，而是 Requirement Refinement Pipeline。**

文档只是这个过程产生的 Artifact。

真正重要的是需求状态从：

```text
Unknown
```

逐渐变成：

```text
Defined
→ Specified
→ Testable
→ Implemented
→ Verified
```

---

# 4. RDD 的三大工程领域

RDD 将整个需求到代码的过程划分为三个核心 Engineering。

## 4.1 Requirement Engineering

解决：

> 为什么做？谁需要？到底要解决什么问题？范围是什么？

主要处理：

```text
Epic
RR
Feature
Story
Dependency
Ownership
Collaboration
```

Requirement Engineering 的目标不是写漂亮的需求文档，而是建立：

> **Requirement Model**

其中包含：

- 需求来源
- 业务目标
- 用户
- 问题
- 价值
- 范围
- 责任团队
- 依赖关系
- 协作关系
- 优先级
- 成功标准
- 未确定事项

---

## 4.2 Specification Engineering

解决：

> 系统具体必须做成什么样？

Specification 不再描述“希望系统做什么”，而描述：

> **系统必须满足哪些可观察、可验证的行为和约束。**

典型 Spec 包括：

```text
Behavior
Interface
Constraint
Invariant
State Transition
Error Handling
Permission
Concurrency
Persistence
Lifecycle
Compatibility
```

例如：

```text
Workspace Specification

S1:
每个 SubAgent Task 必须拥有唯一 Workspace。

S2:
SubAgent 默认只能访问自己的 Workspace。

S3:
Workspace 必须支持文件创建、修改和删除。

S4:
Task 完成后 Workspace 默认保留。

S5:
Workspace 必须能够被 Main Agent 查询。

S6:
Workspace 不允许被其他未授权 Agent 修改。
```

这些内容才是真正可以驱动 Implementation Agent 的信息。

---

## 4.3 Test Engineering

解决：

> 如何证明 Specification 被正确实现？

Test Engineering 不应该只是开发完成之后写测试。

在 RDD 中：

```text
Specification
      ↓
Acceptance Criteria
      ↓
Test
```

Test Engineering 应该参与 Spec 的确定过程。

如果一个 Specification 无法产生清晰的测试，那么通常意味着：

- Spec 不够明确；
- 存在未定义的边界；
- 存在隐含假设；
- 或需求本身还没有真正确定。

因此 Test Agent 可以反向推动 Specification Refinement。

---

# 5. Requirement Model

RDD 的 Requirement 层借鉴成熟的企业需求管理体系。

## 5.1 Epic

Epic 与 RR 属于同一层级，但来源不同。

### Epic

Epic 来源于：

- 项目立项
- 市场调研
- 产品规划
- 内部战略
- 技术规划

它表达：

> **公司主动决定要实现的项目愿景和产品目标。**

例如：

```text
EP-001

新一代 Cloud Console
```

Epic 通常持续数月，可以拆分为多个 Feature。

---

## 5.2 RR

RR（Raw Requirement）来源于：

- 外部客户
- 内部客户
- 服务团队
- 一线反馈
- 跨团队协作需求

它表达：

> **某个客户或协作方提出的原始需求。**

例如：

```text
RR-001

客户希望 ECS Console 支持批量修改资源配置。
```

RR 与 Epic 同属于 Requirement Root，但语义不同：

```text
Epic
  = Internal Initiative

RR
  = External / Internal Request
```

---

# 6. RR 的跨团队拆解

RR 并不意味着所有工作都由当前团队完成。

例如：

```text
RR-001
ECS 客户需求
```

ECS 团队分析发现需要：

```text
Backend
+
Console
```

于是：

```text
RR-001
│
├── ECS Backend
│
└── RR-002
    └── Experience Team
```

RR-002 是一个新的协作需求。

因此 RDD 中的需求关系不是简单的树，而是一个 **Requirement Graph**。

例如：

```text
RR-001
   │
   ├── FE-001
   │      └── US-001
   │
   └── RR-002
          └── FE-002
                 └── US-002
```

这里：

- 父子关系表示需求拆解；
- Related 表示关联；
- RR → RR 表示跨团队需求协作；
- Owner 表示责任边界。

---

# 7. Feature

Feature 是可交付、可感知、具有业务价值的产品能力。

例如：

```text
FE-001
ECS Console 批量配置
```

Feature 是 Requirement Engineering 中重要的能力边界。

Feature 应该回答：

> **我们最终需要增加什么产品能力？**

Feature 可以继续拆分为 Story。

---

# 8. Story

Story 从用户角度描述具体需求。

例如：

```text
US-001

作为 ECS 用户，
我希望能够一次选择多个实例，
以便批量修改实例配置。
```

Story 应满足：

```text
Independent
Negotiable
Valuable
Estimable
Small
Testable
```

Story 是从产品需求进入 Specification Engineering 的重要桥梁。

---

# 9. Specification Model

RDD 不建议把 Spec 简单设计成一个 Markdown 文件。

应该把 Spec 看成一个结构化的 **Specification Model**。

例如：

```yaml
spec:
  id: SPEC-001
  story: US-001

  behavior:
    - id: B-001
      description: ...

  constraints:
    - id: C-001
      description: ...

  invariants:
    - id: I-001
      description: ...

  acceptance_criteria:
    - id: AC-001
      description: ...

  open_questions:
    - id: Q-001
      description: ...

  assumptions:
    - id: A-001
      description: ...
```

Markdown 可以作为人类阅读形式，但内部应该存在结构化模型。

---

# 10. Spec 的四种核心信息

## Behavior

描述系统应该做什么。

```text
当用户选择多个实例并执行批量修改时，
系统必须向所有具有权限的实例提交修改请求。
```

## Constraint

描述系统不能做什么。

```text
用户没有目标实例权限时，
系统不得执行修改。
```

## Invariant

描述任何情况下都必须成立的事实。

```text
未经授权的资源永远不能被修改。
```

## Acceptance Criteria

描述如何判断行为满足要求。

```text
Given 用户选择 3 个具有修改权限的实例
When 执行批量修改
Then 3 个实例均进入修改流程
```

---

# 11. Spec Uncertainty

RDD 的一个关键设计是：

> **LLM 不应该把自己的推测伪装成 Spec。**

Spec 应记录：

```text
Decision
Assumption
Open Question
Evidence
Confidence
```

例如：

```yaml
workspace:
  lifecycle:
    value: task
    status: confirmed

  persistence:
    value: persistent
    status: inferred

  sharing:
    value: explicit
    status: unresolved
```

LLM 应主动寻找：

```text
Unknown
Ambiguous
Conflicting
Unverified
```

而不是为了完成任务强行填空。

---

# 12. Spec Discovery Loop

Specification Engineering 应采用迭代收敛模式。

```text
Candidate Spec
      ↓
Analyze
      ↓
Discover Missing Information
      ↓
Generate Questions
      ↓
Human Decision
      ↓
Refine Spec
      ↓
Generate Tests
      ↓
Detect Gaps
      ↓
Refine Spec
      ↓
Validated Spec
```

直到 Spec 达到可实现状态。

因此：

> **Spec 是一个收敛状态，而不是一次 LLM Generation 的结果。**

---

# 13. Human-in-the-loop

RDD 不要求 LLM 自己决定所有事情。

职责应该明确分工：

```text
LLM
├── Analyze
├── Infer
├── Propose
├── Question
├── Challenge
├── Validate
└── Generate

Human
├── Decide
├── Approve
└── Override
```

例如：

```text
LLM:
Workspace 生命周期存在三个可能方案：

A. Task 生命周期
B. Agent 生命周期
C. 永久存在

根据当前需求，A 最合理。

请确认。
```

Human：

```text
A
```

然后：

```text
Decision
→ Spec
→ Test
```

这样 LLM 负责减少人类需要处理的信息量，而不是替代真正的产品决策。

---

# 14. Test Engineering

Test Agent 从 Spec 生成验证模型。

```text
SPEC-001
   │
   ├── AC-001
   ├── AC-002
   └── AC-003
          │
          ↓
      TEST-001
      TEST-002
      TEST-003
```

每个重要 Spec 应具有可追踪的验证关系：

```text
SPEC
 ↓
Acceptance Criteria
 ↓
Test
```

最终形成：

```text
Code
 ↓
Test
 ↓
Spec
 ↓
Story
 ↓
Feature
 ↓
Epic / RR
```

---

# 15. Agent Architecture

RDD 中的 Agent 不应该全部承担“开发”这一职责。

推荐至少划分：

```text
Requirement Agent
Specification Agent
Test Agent
Implementation Agent
Review Agent
```

## Requirement Agent

负责：

- 解析 Epic / RR
- 分析需求来源
- 识别业务目标
- 识别需求边界
- 发现影响范围
- 识别责任团队
- 拆分 Feature / Story
- 发现跨团队协作
- 提出澄清问题

---

## Specification Agent

负责：

- 从 Story 提取行为
- 定义约束
- 定义状态
- 定义异常
- 定义生命周期
- 定义接口行为
- 定义不变量
- 维护 Spec
- 发现 Specification Gap

---

## Test Agent

负责：

- 分析 Spec 是否可测试
- 生成 Acceptance Criteria
- 设计测试
- 发现边界条件
- 建立 Spec → Test Traceability
- 验证 Implementation

---

## Implementation Agent

只在 Specification 达到可实现状态后工作。

负责：

```text
Spec
 ↓
Implementation Plan
 ↓
Code
 ↓
Unit Test
 ↓
Integration Test
```

Implementation Agent 不应该重新定义业务需求。

如果发现 Spec 存在问题，应返回：

```text
SPECIFICATION_BLOCKED
```

而不是自行修改业务语义。

---

## Review Agent

负责：

- Requirement Review
- Spec Review
- Architecture Review
- Code Review
- Test Review

Review Agent 的核心职责是：

> **挑战已有结论，而不是重新实现一遍。**

---

# 16. Workspace Architecture

每个 Agent 应拥有自己的 Workspace。

Workspace 是：

> **Agent 执行工作的物理上下文。**

例如：

```text
workspace/
├── requirement-analysis/
├── specification/
├── test-analysis/
├── implementation/
└── review/
```

但 Workspace 不是 Agent 之间的主要通信协议。

真正的协作协议应该是：

```text
Requirement
Feature
Story
Spec
Test
Task
Decision
Review
```

即：

> **Workspace 保存工作过程，Work Item / Artifact 保存工作结果。**

这一区分非常重要。

---

# 17. SubAgent 的职责边界

SubAgent 不应该被理解成：

> “另一个可以随便工作的 LLM。”

而应该被理解成：

> **在特定 Work Item 和 Workspace 中工作的专业工程 Agent。**

例如：

```text
US-001
   │
   ├── Requirement Agent
   │
   ├── Spec Agent
   │
   ├── Test Agent
   │
   └── Implementation Agent
```

每个 Agent 都应该知道：

```text
Who am I?
What Work Item am I working on?
What artifacts may I modify?
What artifacts are inputs?
What decisions are already frozen?
What remains unresolved?
```

---

# 18. Work Item Graph

RDD 的核心数据结构应该是 Graph，而不是简单文件夹。

```text
RR
 │
 ├── Feature
 │      └── Story
 │             └── Spec
 │                    └── AC
 │                          └── Test
 │
 └── RR
        └── Feature
```

同时支持：

```text
parent
child
related
depends_on
blocks
implements
verifies
violates
derived_from
```

例如：

```text
RR-001
   ↓ derives
FE-001
   ↓ contains
US-001
   ↓ specifies
SPEC-001
   ↓ verified_by
TEST-001
   ↓ detects
BUG-001
   ↓ violates
SPEC-001
```

这会成为 RDD 最重要的基础设施之一。

---

# 19. Traceability

RDD 必须保证完整的需求追踪能力。

正向追踪：

```text
Epic / RR
    ↓
Feature
    ↓
Story
    ↓
Spec
    ↓
Test
    ↓
Task
    ↓
Code
```

反向追踪：

```text
Code
    ↓
Task
    ↓
Spec
    ↓
Story
    ↓
Feature
    ↓
Epic / RR
```

因此可以回答：

> 这段代码为什么存在？

也可以回答：

> 这个需求最终实现在哪里？

甚至：

> 如果删除这个 Requirement，会影响哪些代码？

---

# 20. BUG 在 RDD 中的定位

BUG 不应该只是：

```text
Bug → Developer
```

而应该建立：

```text
BUG
 ↓
Observed Behavior
 ↓
Expected Behavior
 ↓
Spec
```

然后判断：

```text
Implementation Defect
        OR
Specification Defect
        OR
Requirement Gap
```

例如：

```text
BUG-001

Observed:
Task 完成后 Workspace 被删除。

Expected:
Workspace 应当保留。

检查 Spec：
Spec 没有定义 Workspace 生命周期。
```

此时问题不是简单的代码 Bug，而是：

```text
Specification Gap
```

这意味着 BUG 可以反向推动 RDD：

```text
BUG
 ↓
Spec Refinement
 ↓
Test Refinement
 ↓
Implementation
```

---

# 21. Decision 是 RDD 的一等公民

LLM Agent 工作过程中会产生大量决策。

这些决策不能只存在于聊天记录中。

应该成为：

```text
Decision Artifact
```

例如：

```yaml
decision:
  id: DEC-001
  question: "Workspace 生命周期是什么？"
  options:
    - task
    - agent
    - permanent

  selected: task
  decided_by: human
  reason: "Workspace 与任务上下文绑定"
```

未来 Agent 可以直接读取：

```text
DEC-001
```

而不需要重新讨论。

---

# 22. RDD 状态机

一个 Requirement / Spec 可以具有明确状态。

例如：

```text
DRAFT
  ↓
ANALYZING
  ↓
NEEDS_CLARIFICATION
  ↓
REFINING
  ↓
READY_FOR_SPEC
  ↓
SPECIFYING
  ↓
SPEC_REVIEW
  ↓
SPEC_APPROVED
  ↓
IMPLEMENTING
  ↓
VERIFYING
  ↓
COMPLETED
```

如果 Spec 被发现问题：

```text
SPEC_APPROVED
      ↓
SPEC_INVALIDATED
      ↓
REFINING
```

因此开发不是线性的：

```text
Requirement → Code
```

而是一个可回溯的状态机。

---

# 23. RDD 的核心闭环

最终完整的闭环是：

```text
                  ┌───────────────┐
                  │ Requirement   │
                  └───────┬───────┘
                          ↓
                 Requirement
                 Engineering
                          ↓
                  Feature / Story
                          ↓
                 Specification
                 Engineering
                          ↓
                        Spec
                          ↓
                   Test Engineering
                          ↓
                    Acceptance
                          ↓
                   Implementation
                          ↓
                       Code
                          ↓
                     Verification
                          │
                    ┌─────┴─────┐
                    │           │
                  Pass         Fail
                    │           │
                    ↓           ↓
                 Complete     Refine
                                │
                                └──────→ Spec
```

RDD 最重要的地方就是右侧这个反馈闭环。

---

# 24. RDD 的基本不变量

为了让架构长期可靠，系统应该建立以下 Invariants。

## Requirement Invariant

任何正常开发工作都必须能够追溯到一个 Requirement。

```text
Task → ... → Requirement
```

## Specification Invariant

任何业务代码都应该能够解释其对应的 Specification。

```text
Code → Spec
```

## Test Invariant

任何重要 Specification 都必须有对应的验证方式。

```text
Spec → Test
```

## Decision Invariant

任何影响业务语义的重要决策都必须有记录。

```text
Decision → Artifact
```

## Ownership Invariant

每个 Work Item 必须存在明确 Owner。

## State Invariant

Agent 不能跳过必要的状态。

例如：

```text
DRAFT → IMPLEMENTING
```

在正常流程中应该被禁止。

必须经过：

```text
SPEC_APPROVED
```

---

# 25. RDD 中 LLM 的核心角色

RDD 不应该把 LLM 当作一个简单的 Code Generator。

更准确的定义是：

```text
LLM = Requirement-to-Software Reasoning Engine
```

它承担：

```text
理解
 ↓
分析
 ↓
拆解
 ↓
推理
 ↓
提问
 ↓
验证
 ↓
生成
 ↓
实现
 ↓
测试
 ↓
反馈
```

其中最重要的能力不是 Generation，而是：

> **Refinement。**

---

# 26. RDD 与传统 SDD 的关系

SDD：

```text
Spec
 ↓
Code
```

RDD：

```text
Requirement
 ↓
Specification
 ↓
Test
 ↓
Code
```

因此：

> **SDD 是 RDD 的核心组成部分，而 RDD 覆盖了比 SDD 更完整的软件开发生命周期。**

RDD 解决：

```text
Why
 ↓
What
 ↓
How to verify
 ↓
How to implement
```

而 SDD 主要解决：

```text
What exactly
 ↓
How to implement
```

---

# 27. RDD 的最终架构

整个系统可以抽象为四层。

```text
┌────────────────────────────────────────────┐
│              Requirement Layer             │
│                                            │
│       Epic / RR / Feature / Story          │
│                                            │
│       Requirement Engineering              │
└──────────────────────┬─────────────────────┘
                       ↓
┌────────────────────────────────────────────┐
│             Specification Layer            │
│                                            │
│       Spec / Constraint / Invariant        │
│       Acceptance Criteria / Decision       │
│                                            │
│       Specification Engineering            │
└──────────────────────┬─────────────────────┘
                       ↓
┌────────────────────────────────────────────┐
│                Test Layer                  │
│                                            │
│       Test / Verification / Evidence       │
│                                            │
│             Test Engineering               │
└──────────────────────┬─────────────────────┘
                       ↓
┌────────────────────────────────────────────┐
│             Implementation Layer           │
│                                            │
│       Task / Code / Build / Deploy         │
│                                            │
│             Software Engineering           │
└────────────────────────────────────────────┘
```

贯穿四层的是：

```text
Requirement Graph
Spec Graph
Traceability
Decision
Agent
Workspace
Review
```

---

# 28. 第一版系统应该如何实现

不要一开始就实现完整的 Multi-Agent IDE。

建议首先建立 RDD 的最小闭环：

```text
RR
 ↓
Story
 ↓
Spec
 ↓
Test
 ↓
Code
 ↓
Verification
```

第一阶段只实现五个核心能力：

## 1. Work Item

```text
RR
Feature
Story
Task
BUG
```

## 2. Spec

```text
Spec
Behavior
Constraint
Invariant
AC
```

## 3. Agent

```text
Requirement Agent
Spec Agent
Test Agent
Coding Agent
```

## 4. Traceability

```text
Requirement → Spec → Test → Code
```

## 5. Decision

```text
Question → Human Decision → Artifact
```

这五个能力形成最小可用 RDD。

---

# 29. 推荐的第一条实际开发路径

可以用一个真实的小需求验证架构：

```text
RR-001
“为 Agent 增加 Workspace。”
```

然后让 Requirement Agent 工作：

```text
RR-001
 ↓
需求分析
 ↓
Feature
 ↓
Story
```

然后 Spec Agent：

```text
Story
 ↓
Open Questions
 ↓
Human Decisions
 ↓
Spec
```

然后 Test Agent：

```text
Spec
 ↓
Acceptance Criteria
 ↓
Test
```

最后：

```text
Spec
 ↓
Implementation Agent
 ↓
Code
 ↓
Test
 ↓
Verification
```

如果这一条链能够跑通，RDD 的核心架构就已经被验证。

---

# 30. RDD 的最终定义

RDD 可以最终定义为：

> **Requirements-Driven Development（RDD）是一种面向 AI Agent 软件工程的开发方法，通过 Requirement Engineering、Specification Engineering 和 Test Engineering，将来自 Epic 或 Raw Requirement 的人类意图持续进行需求分析、能力拆解、规格化和验证，最终形成可追踪、可验证、可执行的软件实现。**

RDD 的核心不是：

> **让 AI 写更多代码。**

而是：

> **让 AI 帮助人类把“想要什么”逐渐变成“必须是什么”，再把“必须是什么”可靠地变成代码。**

最终形成：

```text
One-line Vision
       ↓
Requirement
       ↓
Feature
       ↓
Story
       ↓
Specification
       ↓
Acceptance Criteria
       ↓
Test
       ↓
Implementation
       ↓
Code
       ↓
Verified Software
```

并且整个过程保持：

```text
Traceable
    +
Reviewable
    +
Testable
    +
Reversible
    +
Human-controllable
```

这就是 RDD 的核心架构。
