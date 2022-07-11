const { createTable } = require('../utils/table.js')
const { typeToStr } = require('../utils/channels.js')
const range = require('../utils/range.js')

// string to identify that a given `this` variable was initialized by function #runChannelTests
const RUNNER_ID = 'ctr_' + Math.floor(Math.random() * Math.pow(10, 6));

// each expectation function should call this function to avoid scoping mistakes
// NOTE: needs to be a regular function, for `this` to point to the test runner
function _assertTestRunnerPresent() {
  if (this.testRunnerId !== RUNNER_ID) {
    throw new Error(`not in test runner scope`);
  }
}

// used to define expectation functions; can trigger code before and after the expectation
// NOTE: needs to be a regular function, for `this` to point to the test runner
function _wrap(def) {
  // sanity check: def should be a function
  if (typeof def !== 'function') {
    throw new Error(`first argument should be a (regular) function`);
  }
  
  // sanity check: def cannot be an arrow function
  if (def.prototype === undefined) {
    throw new Error(`first argument cannot be an arrow function`);
  }
  
  return (...args) => {
    // run code before expecation function
    _assertTestRunnerPresent()
    
    // run the expecation function
    def(...args)
    
    // run code after expectation function
  }
}

const expectCategory = _wrap(function (specs) {
  this.consumeObj(4, () => {
    specs()
  })
})

const expectTextChannel = _wrap(function (specs) {
  this.consumeObj(0, () => {
    specs()
  })
})

const expectNewsChannel = _wrap(function (specs) {
  this.consumeObj(5, () => {
    specs()
  })
})

const expectVoiceChannel = _wrap(function (specs) {
  this.consumeObj(2, () => {
    specs()
  })
})

const expectStageChannel = _wrap(function (specs) {
  this.consumeObj(13, () => {
    specs()
  })
})

const expectName = _wrap(function (specs) {
  // TODO
})

// TODO
// TODO test outputs are returned by the test runner 
const _createTestOutput = (depth, passed, message) => ({
  depth, // positive integer
  passed, // boolean
  message, // string
})

// TODO
const _createContext = (objects) => ({
  objects, // array of objects (channels, categories...) under test, each object may have children
  pointer: -1, // positive integer, or -1 if not yet used
  testResults: [], // array of test results
})

// TODO
// TODO test results are internal representations
const _createTestResult = (passed, message) => ({
  passed, // boolean
  message, // string
})

const runChannelTests = (actualNestedSortedChannels, specs) => {
  // TODO
  const testOutputs = []

  // TODO
  let contextStack = []

  // TODO
  const getCurrentContext = () => {
    if (contextStack.length < 2) {
      throw new Error(`PANIC: expected context stack to have at least 2 contexts, but found ${contextStack.length}. Did you forget to consume an object first?`)
    }

    // NOTE: upper element in stack is child context, following element is current context
    return contextStack[contextStack.length - 2]
  }

  // TODO
  // TODO ORDER PARENT/CHILD IS NOT CORRECT...
  const closeContext = (expectedType) => {
    // remove the latest context from the stack
    const closedContext = contextStack.pop()

    console.log('TEMP', contextStack.map(ctx => ctx.objects[ctx.pointer]).map(currObj => currObj.name))
    
    // get current depth
    const closedDepth = contextStack.length
    const currentDepth = closedDepth - 1

    if (currentDepth >= 0) {
      const currentContext = contextStack[contextStack.length - 1]
      const currentObj = currentContext.objects[currentContext.pointer]
      // TODO message like "expected category, got channel"???
      // TODO actually verify type
      testOutputs.push(
        _createTestOutput(
          currentDepth,
          true, // TODO!!!
          `${typeToStr(expectedType)} '${currentObj.name}'` // TODO!!!
        )
      )
    }
    
    // TODO get specs from closedContext

    const expectedObjCount = closedContext.pointer + 1
    const actualObjCount = closedContext.objects.length
    const overshoot = expectedObjCount - actualObjCount
    if (overshoot === 0) {
      testOutputs.push(_createTestOutput(
        closedDepth,
        true,
        `child counts match`
      ))
    } else {
      testOutputs.push(_createTestOutput(
        closedDepth,
        false,
        `expected ${expectedObjCount} children, got ${actualObjCount} children`
      ))
    }
  }

  // create a scope in which the tests can run
  ;(function () {
    // mark current `this` instance, such that specs can verify if they have been called within the scope of the test runner
    this.testRunnerId = RUNNER_ID

    // TODO
    this.consumeObj = (expectedType, cb) => {
      // get the current context
      const currentContext = contextStack[contextStack.length - 1]
      if (currentContext === undefined) {
        throw new Error('PANIC: no context available')
      }

      // move pointer to object that we'll consume
      currentContext.pointer++

      // get the consumed object
      const consumedObj = currentContext.objects[currentContext.pointer]

      // in case of overconsumption, this block cannot be executed...
      if (consumedObj !== undefined) {
        // get children of consumed context
        const children =
          consumedObj._children !== undefined ? consumedObj._children : []

        // create a new context with the children of the consumed object
        contextStack.push(_createContext(children))

        // run test cases...
        cb()

        // close the context of the children...
        closeContext(expectedType)
      }
    }

    // TODO
    this.getCurrentObj = () => {
      const currentContext = getCurrentContext()

      const currentObj = currentContext.objects[currentContext.pointer]
      if (currentObj === undefined) {
        throw new Error(`PANIC: could not retrieve current object (undefined)`)
      }

      return currentObj
    }

    // TODO
    // TODO USE THIS FUNC
    this.pushTestResult = (passed, message) => {
      getCurrentContext().testResults.push(_createTestResult(passed, message))
    }

    // initialize stack
    contextStack.push(_createContext(actualNestedSortedChannels))

    // run test cases
    specs()

    // verify and clean up root context
    closeContext(-1)

    // sanity check: no lingering contexts
    if (contextStack.length !== 0) {
      throw new Error(
        `PANIC: test run ended, but context stack is NOT empty (contains ${contextStack.length} contexts)`
      )
    }
  })()

  return testOutputs
}

const formatTestOutputs = (testOutputs) => {
  return createTable(
    testOutputs,
    [
      // TODO connect icon with text (i.e. one column)
      (testResult) => ({
        paddingChar: '.',
        snippets: [
          ' '.repeat(3 * testResult.depth) + (testResult.passed ? '✅' : '❌') + '...',
        ],
      }),
      (testResult) => String(testResult.message),
    ],
    {
      horizontalSeparator: '',
      firstVerticalSeparator: '',
      verticalSeparator: ' ',
      lastVerticalSeparator: '',
      alignLeft: true,
    }
  )
}

module.exports = {
  runChannelTests,
  formatTestOutputs,
  expectCategory,
  expectTextChannel,
  expectNewsChannel,
  expectVoiceChannel,
  expectStageChannel,
  expectName,
}
