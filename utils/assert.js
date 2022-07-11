const assertInteger = (input) => {
  if (!Number.isInteger(input)) {
    throw new Error(`${typeof input} with value '${input}' is not an integer`)
  }
};

const assertIntegerIterable = (input) => {
  for (i of input) {
    assertInteger(i)
  }
};

const assertBigInt = (input) => {
  if (!(typeof input === 'bigint')) {
    throw new Error(`${typeof input} with value '${input}' is not a BigInt`)
  }
}

const assertBigIntIterable = (input) => {
  for (i of input) {
    assertBigInt(i)
  }
};

module.exports = {
  assertInteger,
  assertIntegerIterable,
  assertBigInt,
  assertBigIntIterable,
}