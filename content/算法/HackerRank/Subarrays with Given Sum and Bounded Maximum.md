---
title: Subarrays with Given Sum and Bounded Maximum
date: 2026-05-11 17:12
author: AnyJohn
tags:
  - 算法
---

# Subarrays with Given Sum and Bounded Maximum

## Problem

Given an integer array _nums_ and integers _k_ and _M_, count the number of contiguous subarrays whose sum equals _k_ and whose maximum element is at most _M_.

**Example**

Input

```javascript
nums = [2, -1, 2, 1, -2, 3]
k = 3
M = 2
```

Output

```javascript
2
```

Explanation

```js
We need subarrays with sum = 3 and all elements ≤ 2. 
Also, any subarray containing 3 is invalid because 3 > M. Check all starts:

- From index 0: [2, -1, 2] → sum = 3, max = 2 → valid (count = 1).
- From index 2: [2, 1] → sum = 3, max = 2 → valid (count = 2). No other subarray qualifies. Thus the total count is 2.

```

**Input Format**

- The first line contains an integer n denoting the number of elements in nums.
- The next n lines contains an integer denoting elements in nums followed by the value of k & M.

**Example**

```javascript
6 → number of elements in nums
2 → elements of nums
-1
2
1
-2
3
3 → value of k
2 → value of M
```

**Constraints**

- 0 <= nums.length <= 1000000
- -10^9 <= nums[i] <= 10^9 for all 0 <= i < nums.length
- -10^15 <= k <= 10^15
- -10^9 <= M <= 10^9

**Output Format**

- Returns a non-negative integer denoting the count of all contiguous subarrays of nums.

**Sample Input 0**

```javascript
0
0
0
```

**Sample Output 0**

```javascript
0
```

**Sample Input 1**

```javascript
1
5
5
5

```

**Sample Output 1**

```javascript
1
```

## Resolution

```typescript
function countSubarraysWithSumAndMaxAtMost(nums: number[], k: number, M: number): number {
  // Write your code here
  if (!nums.length) {
    return 0
  }

  let res = 0

  for (let i = 0; i < nums.length; i++) {
    let sum = 0
    let max = -Infinity
    for (let j = i; j < nums.length; j++) {
      sum += nums[j]
      max = Math.max(nums[j], max)
      if (sum === k && max <= M) {
        res++
      }
    }
  }

  return res
}

```
