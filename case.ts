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

console.log(countSubarraysWithSumAndMaxAtMost([2, -1, 2, 1, -2, 3], 3, 2))
