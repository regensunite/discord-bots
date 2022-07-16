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

const isString = (input) => typeof input === 'string' || input instanceof String

const assertString = (input) => {
  if (!isString(input)) {
    throw new Error(`${typeof input} with value '${input}' is not a String`)
  }
}

const assertStringIterable = (input) => {
  if (isString(input)) {
    // NOTE: a string is an iterable itself, but that's clearly not desired here
    throw new Error(`${typeof input} with value '${input}' is not an iterable of strings`)
  }

  for (i of input) {
    assertString(i)
  }
}

const isDiscordId = (input) => isString(input) && input.match(/^\d+$/)

const assertDiscordId = (input) => {
  if (!isDiscordId(input)) {
    throw new Error(`${typeof input} with value '${input}' is not a discord id`)
  }
}

const assertDiscordIdIterable = (input) => {
  if (isString(input)) {
    // NOTE: a string is an iterable itself, but that's clearly not desired here
    throw new Error(
      `${typeof input} with value '${input}' is not an iterable of discord ids`
    )
  }

  for (i of input) {
    assertDiscordId(i)
  }
 }

module.exports = {
  assertInteger,
  assertIntegerIterable,
  assertBigInt,
  assertBigIntIterable,
  isString,
  assertString,
  assertStringIterable,
  isDiscordId,
  assertDiscordId,
  assertDiscordIdIterable,
}
