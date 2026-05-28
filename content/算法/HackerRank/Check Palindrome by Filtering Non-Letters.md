---
title: Check Palindrome by Filtering Non-Letters
date: 2026-05-19 16:23
author: AnyJohn
tags:
  - 算法
---

# Check Palindrome by Filtering Non-Letters

Origin: [Check Palindrome by Filtering Non-Letters](https://www.hackerrank.com/contests/software-engineer-prep-kit/challenges/check-palindrome-filter-non-letters/problem?isFullScreen=true)

Given a string containing letters, digits, and symbols, determine if it reads the same forwards and backwards when considering only alphabetic characters (case-insensitive).

**Example**

Input

```javascript
code = A1b2B!a
```

Output

```javascript
1
```

Explanation

```javascript
- Step 1: Extract only letters → ['A','b','B','a'] 
- Step 2: Convert to lowercase → ['a','b','b','a'] 
- Step 3: Compare sequence forward and backward: 'abba' == 'abba' → true
```

**Input Format**

- A string _code_ containing letters (A–Z, a–z), digits (0–9), and symbols

**Constraints**

- 0 <= code.length <= 1000
- For all 0 <= i < code.length: 33 <= ASCII(code[i]) <= 126
- code contains only printable ASCII characters (letters, digits, symbols)

**Output Format**

- Return a boolean value: 1 if true & 0 if false.
**Sample Input 0**

```javascript
Z
```

**Sample Output 0**

```javascript
1
```

**Sample Input 1**

```javascript
abc123cba
```

**Sample Output 1**

```javascript
1
```

## Resolution

```javascript
function isAlphabeticPalindrome(code: string): boolean {
  // Write your code here
  if (!code)
    return false;
  const arr = code
    .toLocaleLowerCase()
    .split('')
    .filter(s => /[a-z]/i.test(s));
  const reArr = [...arr].reverse();
  // const reArr = arr.toReversed(); es2023+
  return reArr.join() === arr.join();
}
```
