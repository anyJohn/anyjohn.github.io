---
title: Find the Smallest Missing Positive Integer
date: 2026-05-21 20:05
author: AnyJohn
tags:
  - 算法
---

# Find the Smallest Missing Positive Integer

Origin: [Find the Smallest Missing Positive Integer](https://www.hackerrank.com/contests/software-engineer-prep-kit/challenges/find-smallest-missing-positive-integer/problem)

Given an unsorted array of integers, find the smallest positive integer not present in the array in O(n) time and O(1) extra space.

**Example**

Input

```javascript
orderNumbers = [3, 4, -1, 1]
```

Output

2

Explanation

We want the smallest positive missing integer.

Start with `[3, 4, -1, 1]`

- i=0: value 3 ⇒ swap with index 2 ⇒ `[-1, 4, 3, 1]`
- i=0: value -1 is out of range ⇒ move on
- i=1: value 4 ⇒ swap with index 3 ⇒ `[-1, 1, 3, 4]`
- i=1: value 1 ⇒ swap with index 0 ⇒ `[1, -1, 3, 4]`
- now 1 at index 0, 3 at 2, 4 at 3; -1 remains at index 1

Scan from index 0:

index 0 has 1 (correct), index 1 has -1 (not 2) ⇒ missing positive is 2

**Input Format**

- An integer n on the first line, where 0 ≤ n ≤ 1000.
- The next n lines contains an integer representing orderNumbers[i].

**Example**

```javascript
4
3
4
-1
1
```

here 4 is the length of array, followed by the elements of array on each line.

**Constraints**

- 0 <= orderNumbers.length <= 1000
- -10^9 <= orderNumbers[i] <= 10^9 for all 0 <= i < orderNumbers.length
- Duplicates are allowed in orderNumbers
- Negative numbers and zero are allowed in orderNumbers

**Output Format**

- A single integer denoting the smallest positive order number (≥1) that does not appear in the input array.

**Sample Input 0**

```javascript
0
```

**Sample Output 0**

```javascript
1
```

**Sample Input 1**

```javascript
1
1
```

**Sample Output 1**

```javascript
2
```

## Resolution

```javascript

function findSmallestMissingPositive(orderNumbers: number[]): number {
    // Write your code here
    const n = orderNumbers.length;
    for (let i = 0; i < n; i++) {
        while (
            orderNumbers[i] > 0 &&
            orderNumbers[i] <= n &&
            orderNumbers[orderNumbers[i] - 1] !== orderNumbers[i]
        ) {
            const j = orderNumbers[i] - 1;
            [orderNumbers[i], orderNumbers[j]] = [
                orderNumbers[j],
                orderNumbers[i],
            ];
        }
    }
    for (let i = 0; i < n; i++) {
        if (orderNumbers[i] !== i + 1) {
            return i + 1;
        }
    }
    return n + 1;
}
```

## 找到最小缺失正整数 —— Cyclic Sort 解法详解

### 背景：算法目标

要把每个"有意义"的数 `x` 放到数组的第 `x-1` 个位置（1 → 索引0，2 → 索引1...），这样遍历时第一个 `nums[i] !== i+1` 的位置就对应缺失的最小正整数。

三个条件回答了同一个问题：**nums[i] 这个数，值不值得交换？**

---

### 条件一：`nums[i] > 0`

**只有正整数才有"正确的位置"。**

0 和负数没有对应的索引——不存在"第 0 个位置"或"第 -5 个位置"。它们不可能被放到任何正确位置，留在原地当占位符，跳过。

```javascript

[3, -1, 4]

↑ 负数，没有"正确的家"，忽略

```

---

### 条件二：`nums[i] <= n`

**太大的数数组装不下。**

数组长度 n=5 时，数字 7 的"正确位置"是索引 6，但数组只有索引 0~4。强行访问 `orderNumbers[6]` 会越界崩溃。这些数超出范围，不可能被安置，跳过。

```javascript

[5, 7, 3] (n=3)

↑ 7 > 3，索引 6 不存在，忽略

```

---

### 条件三：`nums[nums[i] - 1] !== nums[i]`

**目标位置已经有正确的数了（重复值），再换没意义，还会死循环。**

这是最关键也最容易漏掉的条件。两个作用：

#### ① 防死循环

如果 nums[i] = 1，而 nums[0] 已经是 1，没有这个条件就会无限交换：

```javascript

[1, 1] → swap(0, 0) → [1, 1] → swap(0, 0) → ... 永远循环

```

#### ② 防无意义交换

重复值交换后完全一样，while 永远无法"往前推进"，程序卡死。

---

### 为什么必须是 while 而非 if？

一次交换后，新来的元素可能也不在正确位置：

```javascript

[3, 4, -1, 1] i=1，nums[1]=4

交换 4 ↔ nums[3]=1 → [-1, 1, 3, 4]

现在 nums[1]=1，但 1 应该在索引 0！

如果用 if 就停了 → 错误

while 继续： 1 ↔ nums[0]=-1 → [1, -1, 3, 4] ✓

现在 nums[1]=-1，条件 ① 不满足，停止

```

每次交换可能带回来一个新问题，所以必须 `while` 循环直到当前元素**不值得再换为止**。

---

### 复杂度分析

- **时间复杂度**：O(n) — 每个数最多被交换一次到正确位置，内层 while 的总执行次数不超过 n 次
- **空间复杂度**：O(1) — 原地交换，无额外数据结构
