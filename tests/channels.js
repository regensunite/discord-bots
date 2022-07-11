const { createTable } = require('../utils/table.js')
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

const expectObj = _wrap(function (specs) {
  // TODO is this propagated correctly?
  this.consumeObj(() => {
    // TODO
    specs()
  })
})

const expectCategory = _wrap(function (specs) {
  // TODO extend from expectObj
})

const expectTextChannel = _wrap(function (specs) {
  // TODO extend from expectObj
})

const expectNewsChannel = _wrap(function (specs) {
  // TODO extend from expectObj
})

const expectVoiceChannel = _wrap(function (specs) {
  // TODO extend from expectObj
})

const expectName = _wrap(function (specs) {
  // TODO
})

// TODO
const _createContext = (objects) => ({
  objects, // array of objects (channels, categories...) under test, each object may have children
  pointer: -1, // integer
  testResults: [], // array of test results
})

const _createTestResult = (passed) => ({
  passed, // boolean
})

const runChannelTests = (actualNestedSortedChannels, specs) => {
  // TODO
  let contextStack = []

  // TODO
  const closeContext = () => {
    // remove the latest context from the stack
    const exitingContext = contextStack.pop()

    // TODO temp
    console.log(
      'TEMP closeContext',
      exitingContext.objects.length,
      exitingContext.pointer,
      contextStack.map(ctx => ctx.objects[ctx.pointer]).map(obj => obj.name)
    )

    const overshoot = exitingContext.pointer + 1 - exitingContext.objects.length
    if (overshoot < 0) {
      // TODO
      console.log('too little consumed:', -overshoot)
    } else if (overshoot > 0) {
      // TODO
      console.log('too much consumed:', overshoot)
    } else {
      // TODO
      console.log('gg')
    }
  }

  // TODO
  const testResults = []

  // create a scope in which the tests can run
  ;(function () {
    // mark current `this` instance, such that specs can verify if they have been called within the scope of the test runner
    this.testRunnerId = RUNNER_ID

    // TODO
    this.consumeObj = (cb) => {
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
        const children = consumedObj._children !== undefined ? consumedObj._children : []

        // create a new context with the children of the consumed object
        contextStack.push(_createContext(children))

        // run test cases...
        cb(consumedObj)

        // close the context of the children...
        closeContext()
      }
    }

    // initialize stack
    contextStack.push(_createContext(actualNestedSortedChannels))
    
    // run test cases
    specs()

    // verify and clean up root context
    closeContext()

    // sanity check: no lingering contexts
    if (contextStack.length !== 0) {
      throw new Error(
        `PANIC: test run ended, but context stack is NOT empty (contains ${contextStack.length} contexts)`
      )
    }
  })()

  return testResults
}

const formatTestResults = (testResults) => {
  return createTable(
    // TODO rows
    range(0, 4, 1),
    // TODO column generators
    [
      (row) => `aaa`,
      (row) => '5',
      (row) => [`bbbbbbbbbb`, `xx`],
      (row) => [`ccc`],
      (row) => [`dddd`, 'sdfhdsugksdjghfsdjgfsdfgsdfgdfs', '123'],
    ],
    // TODO table settings
    {
      horizontalSeparator: '',
      firstVerticalSeparator: '',
      verticalSeparator: '   ',
      lastVerticalSeparator: '',
      alignLeft: true,
    },
  )
}

module.exports = {
  runChannelTests,
  formatTestResults,
  expectObj, // TODO temp
  expectCategory,
  expectTextChannel,
  expectNewsChannel,
  expectVoiceChannel,
  expectName,
}
