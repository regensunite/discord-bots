const {
  assertInteger
} = require('./assert.js')

module.exports = (start, end, step = 1) => {
  assertInteger(start)
  assertInteger(end)
  assertInteger(step)
  
  // step cannot be 0
  if (step === 0) {
    throw new Error(`step cannot be 0`);
  }
  
  // if the range is ascending, end should be bigger than start
  if (step > 0 && start > end) {
    throw new Error(`end (${end}) should be bigger than or equal to start (${start}) for ascending range`);
  }
  
  // if the range is descending, start should be bigger than end
  if (step < 0 && start < end) {
    throw new Error(`start (${start}) should be bigger than or equal to end (${end}) for descending range`);
  }
  
  return Array.from(
    { length: Math.trunc((end - start) / step) + 1 },
    (_, i) => start + (i * step)
  );
}