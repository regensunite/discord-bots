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

// create a test context object (used in the stack of the test runner for each nesting level of test cases)
const _createContext = (objects) => ({
  objects, // array of objects (channels, categories...) under test, each object may have children
  pointer: -1, // positive integer, or -1 if not yet used
  testResults: [], // array of test results
})

// create a test result (used by test cases to report a pass/fail scenario to the user)
const _createTestResult = (passed, message, _children = []) => ({
  passed, // true if test case has been passed, false if test case has failed, null if result of test case depends on children
  message, // string
  _children, // array of test results
})

// DISCORD TEST RUNNER 🎉
// two types of test cases exist:
// - a "consuming" test case: it advances the pointer of the current context (i.e. it consumes an object under test),
//                            may run a few test scenarios itself, and passes control to child test cases
// - a "verifying" test case: it does some checks on the current object under test
//
// At the root level (i.e. directly running inside the "specs" callback), only "consuming" test cases are allowed,
// because an object under test needs to be "consumed" first, before "verifying" test cases can run.
// "consuming" test cases can be nested, in which case the nested "consuming" test case, will "consume" children
// of the object currently under test.
const runChannelTests = (actualNestedSortedChannels, specs) => {
  // stack containing one context object for every level of nesting that the test runner is currently dealing with
  let contextStack = []

  // get the context of the object currently under test
  // NOTE: the last context in the stack is always the context of the current object's children!
  const getCurrentContext = () => {
    if (contextStack.length < 2) {
      throw new Error(`PANIC: expected context stack to have at least 2 contexts, but found ${contextStack.length}. Did you forget to consume an object first?`)
    }

    // NOTE: upper element in stack is child context, following element is current context
    return contextStack[contextStack.length - 2]
  }

  // close the uppermost context
  // NOTE: this function is called by the test runner to finalize processing a test case (and all its children)
  const closeContext = (expectedType) => {
    // remove the latest context from the stack
    const closedContext = contextStack.pop()

    // decide if the amount of objects matches the amount of "consumptions"
    const expectedObjCount = closedContext.pointer + 1
    const actualObjCount = closedContext.objects.length
    const overshoot = expectedObjCount - actualObjCount
    if (overshoot === 0) {
      closedContext.testResults.push(_createTestResult(
        true,
        `child counts match`
      ))
    } else {
      closedContext.testResults.push(_createTestResult(
        false,
        `expected ${expectedObjCount} children, got ${actualObjCount} children`
      ))
    }

    // EDGE CASE: when the root context is being closed, the stack will be empty
    const currentContext = contextStack[contextStack.length - 1]
    if (currentContext !== undefined) {
      const currentObj = currentContext.objects[currentContext.pointer]

      // verify object type AND collect test results of children
      if (currentObj.type === expectedType) {
        currentContext.testResults.push(_createTestResult(
          null, // let icon depend on child results
          `${typeToStr(expectedType)} '${currentObj.name}'`,
          closedContext.testResults
        ))
      } else {
        currentContext.testResults.push(_createTestResult(
          false, // this test case has failed for sure
          `expected a ${typeToStr(expectedType)}, got ${typeToStr(currentObj.type)} '${currentObj.name}'`,
          closedContext.testResults
        ))
      }
    }

    return closedContext
  }

  // create a scope in which the tests can run
  return (function () {
    // mark current `this` instance, such that specs can verify if they have been called within the scope of the test runner
    this.testRunnerId = RUNNER_ID

    // function to use when implementing a "consuming" test case
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

    // TODO what happens if I call this at the root level?
    // function to use when implementing a "verifying" test case
    this.getCurrentObj = () => {
      const currentContext = getCurrentContext()

      const currentObj = currentContext.objects[currentContext.pointer]
      if (currentObj === undefined) {
        throw new Error(`PANIC: could not retrieve current object (undefined)`)
      }

      return currentObj
    }

    // all test cases should call this method to report a pass/fail scenario
    this.pushTestResult = (passed, message) => {
      getCurrentContext().testResults.push(_createTestResult(passed, message))
    }

    // initialize stack
    contextStack.push(_createContext(actualNestedSortedChannels))

    // run test cases
    specs()

    // verify and clean up root context
    const rootContext = closeContext(-1)

    // sanity check: no lingering contexts
    if (contextStack.length !== 0) {
      throw new Error(
        `PANIC: test run ended, but context stack is NOT empty (contains ${contextStack.length} contexts)`
      )
    }

    // return the root test results (contains nested test results)
    return rootContext.testResults 
  })()
}

const formatTestResults = (testResults) => {
  const flattenTestResults = (input, depth = 0, initial = []) => input.reduce((output, currentTestResult) => {
    const childDepth = depth + 1

    const flattenedChildren = flattenTestResults(
      currentTestResult._children,
      childDepth
    )

    const directChildren = flattenedChildren.filter(
      (childTestResult) => childTestResult.depth === childDepth
    )

    // NOTE: while we only read the pass counts of direct children, those counts already include the pass counts of their children etc.
    const childrenPassCount = directChildren.reduce(
      (count, childTestResult) => count + childTestResult.passCount,
      0
    )

    // NOTE: while we only read the total counts of direct children, those counts already include the total counts of their children etc.
    const childrenTotalCount = directChildren.reduce(
      (count, childTestResult) => count + childTestResult.totalCount,
      0
    )

    const passed =
      currentTestResult.passed === null
        ? childrenPassCount === childrenTotalCount
        : currentTestResult.passed

    return [
      ...output,
      {
        ...currentTestResult,
        passCount: childrenPassCount + (passed ? 1 : 0), // total count of children, plus one for the current test result IF the current test result passed
        totalCount: childrenTotalCount + 1, // total count of children, plus one for the current test result
        passed,
        depth, // since we're flattening everything, keep track of the original depth (for indentation)
        _children: undefined, // children shouldn't be in the output
      },
      ...flattenedChildren,
    ]
  }, initial)

  const flattenedTestResults = flattenTestResults(testResults)

  return createTable(
    flattenedTestResults,
    [
      (testResult) => {
        const icon = testResult.passed ? '✅' : '❌'
        const indentation = ' '.repeat(3 * testResult.depth)

        return [`${indentation}${icon} ${testResult.message}`]
      },
      (testResult) => {
        return [`(${testResult.passCount}/${testResult.totalCount})`]
      },
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
  formatTestResults,
  expectCategory,
  expectTextChannel,
  expectNewsChannel,
  expectVoiceChannel,
  expectStageChannel,
  expectName,
}
