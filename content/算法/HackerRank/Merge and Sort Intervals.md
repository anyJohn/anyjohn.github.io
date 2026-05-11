---
title: Merge and Sort Intervals
date: 2026-05-11 16:27
author: AnyJohn
tags:
  - 算法
---

# Merge and Sort Intervals

## Problem

Given an array of intervals [startTime, endTime], merge all overlapping intervals and return a sorted array of non-overlapping intervals.

**Example**

Input

```javascript
intervals = [[1, 3], [2, 6], [8, 10], [15, 18]]
```

Output

```javascript
[[1, 6], [8, 10], [15, 18]]
```

Explanation

```javascript
- Step 1: Sort intervals by start time (already sorted).
- Step 2: Initialize merged list with first interval [1,3].
- Step 3: Compare [2,6] with last merged [1,3]. They overlap (2 ≤ 3), so merge into [1,6]. 
- Step 4: Compare [8,10] with last merged [1,6]. No overlap (8 > 6), append [8,10].
- Step 5: Compare [15,18] with last merged [8,10]. No overlap (15 > 10), append [15,18].

Result: [[1,6],[8,10],[15,18]].
```

**Input Format**

- The first line contains an integer denoting the number of intervals.
- The second line contains an integer denoting the length of individual interval array.
- Each of the next N lines contains two space-separated integers startTime and endTime
- Intervals may be provided in any order; duplicates and fully contained intervals are allowed.

**Example**

```javascript
4
2
1 3
2 6
8 10
15 18
```

here, 4 is the number of intervals, 2 is the length of individual interval array, followed by the intervals.

**Constraints**

- 0 <= intervals.length <= 100000
- intervals[i].length == 2 for all 0 <= i < intervals.length
- 0 <= intervals[i][0] < intervals[i][1] <= 10^9 for all 0 <= i < intervals.length

**Output Format**

- Return a 2D array of two space-separated integers start and end, representing the merged intervals sorted by increasing start time.

**Sample Input 0**

```javascript
0
0
```

**Sample Input 1**

```javascript
1
2
5 10
```

**Sample Output 1**

```javascript
5 10
```

## Resolution

```typescript

function mergeHighDefinitionIntervals(intervals: number[][]): number[][] {
  // Write your code here
  if (!intervals?.length) {
    return []
  }
  intervals.sort((a, b) => a[0] - b[0])
  const merged: number[][] = []
  const temp: number[] = [...intervals[0]]

  for (let i = 1; i < intervals.length; i++) {
    const startTime = intervals[i][0]
    const endTime = intervals[i][1]
    if (temp[1] >= startTime) {
      temp[1] = Math.max(temp[1], endTime)
    } else {
      merged.push([...temp])
      temp[0] = startTime
      temp[1] = endTime
    }
  }
  if (temp?.length) {
    merged.push([...temp])
  }
  return merged
}```
