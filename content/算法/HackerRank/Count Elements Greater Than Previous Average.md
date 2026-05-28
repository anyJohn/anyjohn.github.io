---
title: Count Elements Greater Than Previous Average
date: 2026-05-11 11:14
author: AnyJohn
tags:
  - 算法
---

# Count Elements Greater Than Previous Average

Origin: [Count Elements Greater Than Previous Average](https://www.hackerrank.com/contests/software-engineer-prep-kit/challenges/count-elements-greater-than-previous-average/problem)

## Problem

Given an array of positive integers, return the number of elements that are strictly greater than the average of all previous elements. Skip the first element.

**Example**

Input

```js
responseTimes = [100, 200, 150,300]
```

Output

`2`

Explanation

- Day 0: 100 (no previous days, skip)
- Day 1: 200 > average(100) = 100 → count = 1
- Day 2: 150 vs average(100, 200) = 150 → not greater → count = 1
- Day 3: 300 > average(100, 200, 150) = 150 → count = 2 Return 2.

**Input Format**

- The first line contains an integer _n_ (0 ≤ n ≤ 1000), the number of days.
- If n > 0, the next n lines contains an integer representing responseTimes[i].
- If n = 0, the second line is omitted or empty.

**Example**

```js
4
100
200
150
300
```

here 4 is the length of array, followed by the elements of array on each line.

**Constraints**

- 0 <= responseTimes.length <= 1000
- 1 <= responseTimes[i] <= 10^9 for 0 <= i < responseTimes.length

**Output Format**

- A single integer depicting the count of days.

**Sample Input 0**

`0`

**Sample Output 0**

`0`

**Sample Input 1**

`1`

`100`

**Sample Output 1**

`0`

## Resolution

```typescript
function countResponseTimeRegressions(responseTimes: number[]): number {
  // Write your code here
  let count = 0
  let average = responseTimes[0]

  for (let i = 1; i < responseTimes.length; i++) {
    average = (average * i + responseTimes[i]) / (i + 1)
    if (responseTimes[i] > average) {
      count++
    }
  }
  return count
}
```
