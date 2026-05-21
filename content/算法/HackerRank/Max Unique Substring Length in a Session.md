---
title: Max Unique Substring Length in a Session
date: 2026-05-19 19:43
author: AnyJohn
tags:
  - 算法
---

# Max Unique Substring Length in a Session

Origin: [Max Unique Substring Length in a Session](https://www.hackerrank.com/contests/software-engineer-prep-kit/challenges/max-unique-substring-length-in-session/problem)

Given a string of lowercase letters with sessions separated by '' characters, find the maximum length of a substring with all distinct letters within any single session.

**Example**

Input

```javascript
sessionString = abcabcbb
```

Output

```javascript
3
```

Explanation

- There is only one session: "abcabcbb".
- Scanning with a sliding window for distinct letters, the longest substrings without repeats are "abc", "bca" and so on, each of length 3.
- Therefore, the result is 3.

**Input Format**

- A single line containing the string sessionString.

**Constraints**

```javascript
- 0 <= S.length <= 100000
- For all i in [0, S.length]: S[i] is either '*' or a lowercase letter 'a' to 'z'
- Each session is defined as a maximal contiguous substring of S without '*' characters
- Number of sessions (segments between '*') is at most S.length + 1
```

**Output Format**

- A single integer denoting the maximum length among all substrings. If sessionString is empty or contains only '*', output 0.

**Sample Input 0**

```javascript
*
```

**Sample Output 0**

```javascript
0
```

**Sample Input 1**

```javascript
aa
```

**Sample Output 1**

```javascript
1
```

## Resolution

```javascript
function maxDistinctSubstringLengthInSessions(sessionString: string): number {
  // Write your code here
  let left = 0;
  let maxLength = 0;
  const charSet = new Set();
  for (let right = 0; right < sessionString.length; right++) {
    const char = sessionString[right];
    if (char === '*') {
      charSet.clear();
      left = right + 1;
    }
    else {
      while (charSet.has(char)) {
        charSet.delete(sessionString[left]);
        left++;
      }
      charSet.add(char);
      maxLength = Math.max(maxLength, right - left + 1);
    }
  }
  return maxLength;
}
```
