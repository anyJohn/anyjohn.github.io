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

const res = countResponseTimeRegressions([100, 200, 150, 300]) // Output: 2
console.log(res)
