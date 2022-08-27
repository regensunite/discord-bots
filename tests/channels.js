const { createTable } = require('../utils/table.js')
const { typeToStr } = require('../utils/channels.js')
const { AssertionError, expect } = require('chai');
const { assertBigInt, assertString } = require('../utils/assert.js');
const { permissionBitsToString, calculateRoleOverwrites, calculateRoleBasePermissions, diffPermissionBits, getPermissionNames, EVERYONE_ROLE_NAME } = require('../utils/discord/permissions.js');

// global namespace of the test runner (key added to global scrope, under which test runner public API resides)
const RUNNER_KEY = 'ctrK_' + Math.floor(Math.random() * Math.pow(10, 6));

// each expectation function should call this function to avoid scoping mistakes
// NOTE: needs to be a regular function, for `this` to point to the global scope
function _assertTestRunnerPresent() {
  if (this[RUNNER_KEY] === undefined) {
    throw new Error(`not in test runner scope`)
  }
}

// used to define expectation functions; can trigger code before and after the expectation
// NOTE: needs to be a regular function, for `this` to point to the global scope
function _wrap(def, generatesTestResults = true) {
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
    const testResultCountBefore = this[RUNNER_KEY].peekContext().testResults.length
    def(...args)
    const testResultCountAfter = this[RUNNER_KEY].peekContext().testResults.length
    const newTestResultCount = testResultCountAfter - testResultCountBefore

    if (generatesTestResults && newTestResultCount <= 0) {
      console.error('top context before aborting', this[RUNNER_KEY].peekContext())
      throw new Error('test case did not push any test results, aborting...')
    }

    if (!generatesTestResults && newTestResultCount !== 0) {
      console.error('top context before aborting', this[RUNNER_KEY].peekContext())
      throw new Error(`function is not supposed to generate test results, but generated ${newTestResultCount}`)
    }
    
    // run code after expectation function
  }
}

// helper function to create "verifying" test cases with chai
// NOTE: needs to be a regular function, for `this` to point to the global scope
function _chaiTestCase (runChai, getPassMessage, getFailMessage) {
  try {
    // run the test case(s)
    runChai()

    // test case passed
    this[RUNNER_KEY].pushTestResult(true, getPassMessage())
  } catch (e) {
    // rethrow errors that we do not care about
    if (!(e instanceof AssertionError)) {
      throw e
    }

    // test case failed
    this[RUNNER_KEY].pushTestResult(false, getFailMessage(e))
  }
}

const logCurrentObj = _wrap(function (label) {
  console.log(label, this[RUNNER_KEY].getCurrentObj())
}, false) // NOTE: this function does NOT generate test results

// run the specs (test case(s)) for all categories and channels in the current context that haven't been consumed yet
// this implies that no specific objects are expected, but rather that they should be tested in a general way
const forEachRemaining = _wrap(function (specs) {
  const context = this[RUNNER_KEY].peekContext()

  const currentPointer = context.pointer
  while (context.pointer < context.objects.length - 1) {
    specs()
    if (currentPointer === context.pointer) {
      throw new Error('Specs inside forEachRemaining block failed to advance pointer, this would result in an infinite loop. Did you forget to consume an object?')
    }
  }
})

const expectRoleNames = _wrap(function (expectedRoleNames) {
  const guild = this[RUNNER_KEY].getGuild()

  const actualRoleNames = guild.roles.map(role => role.name)

  _chaiTestCase(
    () => expect(actualRoleNames).to.have.same.members(expectedRoleNames),
    () => `the following roles are present in the server: ${expectedRoleNames.join(', ')}`,
    // NOTE: do not use error message from chai, because that does not fully render the arrays
    (e) => `roles in server: got ${actualRoleNames.join(', ')}; expected ${expectedRoleNames.join(', ')}`
  )
})

const expectUniqueRoleNames = _wrap(function () {
  const guild = this[RUNNER_KEY].getGuild()

  const existingRoleNames = new Set()
  for (let role of guild.roles) {
    const roleNameLowercase = role.name.toLowerCase()
    if (existingRoleNames.has(roleNameLowercase)) {
      this[RUNNER_KEY].pushTestResult(false, `server has more than one role with name '${roleNameLowercase}' (case-insensitive)`);
      return
    }
    existingRoleNames.add(roleNameLowercase)
  }

  this[RUNNER_KEY].pushTestResult(true, `server does not have roles with the same name`)
})

const expectAny = _wrap(function (specs) {
  this[RUNNER_KEY].consumeObj(null, () => {
    specs()
  })
})

const expectCategory = _wrap(function (specs) {
  this[RUNNER_KEY].consumeObj(4, () => {
    specs()
  })
})

const expectTextChannel = _wrap(function (specs) {
  this[RUNNER_KEY].consumeObj(0, () => {
    specs()
  })
})

const expectNewsChannel = _wrap(function (specs) {
  this[RUNNER_KEY].consumeObj(5, () => {
    specs()
  })
})

const expectVoiceChannel = _wrap(function (specs) {
  this[RUNNER_KEY].consumeObj(2, () => {
    specs()
  })
})

const expectStageChannel = _wrap(function (specs) {
  this[RUNNER_KEY].consumeObj(13, () => {
    specs()
  })
})

const expectName = _wrap(function (expectedName) {
  const currentObj = this[RUNNER_KEY].getCurrentObj()

  const typeStr = typeToStr(currentObj.type).toLocaleLowerCase()

  _chaiTestCase(
    () => expect(currentObj.name).to.equal(expectedName, `${typeStr} name`),
    () => `${typeStr} name is '${expectedName}'`, // category name is 'EXPECTED'
    (e) => e.message // category name: expected 'ACTUAL' to equal 'EXPECTED'
  )
})

const expectPermissionsForRole = _wrap(function (expectedRoleName, expectedRolePermissionBits) {
  assertString(expectedRoleName)
  assertBigInt(expectedRolePermissionBits)

  const guild = this[RUNNER_KEY].getGuild()
  const currentObj = this[RUNNER_KEY].getCurrentObj()

  const role = guild.roles.find((role) => role.name === expectedRoleName)
  if (role === undefined) {
    this[RUNNER_KEY].pushTestResult(false, `expected role '${expectedRoleName}' with permissions '${permissionBitsToString(expectedRolePermissionBits)}', but role '${expectedRoleName}' does not exist`)
    return
  }

  const roleBasePermissions = calculateRoleBasePermissions(guild, [role.id])
  const rolePermissionsInCurrentObj = calculateRoleOverwrites(roleBasePermissions, currentObj, [role.id])

  _chaiTestCase(
    () => expect(rolePermissionsInCurrentObj).to.equal(expectedRolePermissionBits),
    () => `permissions for role '${expectedRoleName}' are '${permissionBitsToString(expectedRolePermissionBits)}' (${getPermissionNames(expectedRolePermissionBits).join(', ')})`,
    // NOTE: do not use error message from chai, because that does not render permissions nicely
    (e) => `permissions for role '${expectedRoleName}': expected '${permissionBitsToString(rolePermissionsInCurrentObj)}' to equal '${permissionBitsToString(expectedRolePermissionBits)}' (${diffPermissionBits(rolePermissionsInCurrentObj, expectedRolePermissionBits)})`
  )
})

// NOTE: by default (inheritEveryoneRole = true), this expectation will try to locate the permissions for role @everyone
//       and add those permissions to the role under test
const expectPermissions = _wrap(function (permissionsByRole, inheritEveryoneRole = true) {
  const guild = this[RUNNER_KEY].getGuild();

  for (let role of guild.roles) {
    const expectedRolePermissionBits = permissionsByRole?.hasOwnProperty(role.name) ? permissionsByRole[role.name] : 0n
    const everyoneRolePermissionBits = permissionsByRole?.hasOwnProperty(EVERYONE_ROLE_NAME) ? permissionsByRole[EVERYONE_ROLE_NAME] : 0n
    const combinedPermissionBits = expectedRolePermissionBits | everyoneRolePermissionBits
    expectPermissionsForRole(role.name, inheritEveryoneRole ? combinedPermissionBits : expectedRolePermissionBits)
  }
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
const runChannelTests = (guild, actualNestedSortedChannels, specs) => {
  // stack containing one context object for every level of nesting that the test runner is currently dealing with
  let contextStack = []

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
      if (expectedType === null || currentObj.type === expectedType) {
        currentContext.testResults.push(_createTestResult(
          null, // let icon depend on child results
          `${typeToStr(currentObj.type)} '${currentObj.name}'`,
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

  // access the global scope via the `this` keyword of an immediately invoked function expression
  return (function () {
    // create the test runner object in the global scope
    this[RUNNER_KEY] = {}

    // convenience function in case a test case needs access to the latest context in the stack
    // try to avoid this unless really necessary
    this[RUNNER_KEY].peekContext = () => {
      const topContext = contextStack[contextStack.length - 1]
      if (topContext === undefined) {
        throw new Error('PANIC: no context available')
      }
      return topContext
    }

    // function to use when implementing a "consuming" test case
    this[RUNNER_KEY].consumeObj = (expectedType, cb) => {
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
      } else {
        // notify that we're overconsuming
        currentContext.testResults.push(_createTestResult(false, `expected ${typeToStr(expectedType)}, but no objects left in current context`))
      }
    }

    // function to use when implementing a "verifying" test case
    this[RUNNER_KEY].getCurrentObj = () => {
      const parentContext = contextStack[contextStack.length - 2]
      const currentObj = parentContext?.objects[parentContext?.pointer]
      if (currentObj === undefined) {
        throw new Error(`PANIC: could not retrieve current object (undefined). Did you forget to consume an object first?`)
      }

      return {
        ...currentObj, // best-effort attempt at isolating, in case a test case goes rogue and modifies the current object
        _children: undefined, // shield children from "verifying" tests (children can be tested by nesting test cases)
      }
    }

    // get the guild (useful to implement some "verifying" test cases)
    this[RUNNER_KEY].getGuild = () => {
      if (!guild) {
        throw new Error(`PANIC: guild was not provided`)
      }
      return guild
    }

    // all test cases should call this method to report a pass/fail scenario
    this[RUNNER_KEY].pushTestResult = (passed, message) => {
      const currentContext = contextStack[contextStack.length - 1]
      if (currentContext?.testResults === undefined) {
        throw new Error(`PANIC: could not retrieve test results of current context (undefined)`)
      }

      currentContext.testResults.push(_createTestResult(passed, message))
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

    // clean up the global scope
    this[RUNNER_KEY] = undefined

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

    const [childrenPassCount, _, childrenTotalCount] = testCounts(flattenedChildren, childDepth)

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

  const testCounts = (flattenedTestResults, depth = 0) => {
    const testResultsAtDepth = flattenedTestResults.filter(
      (testResult) => testResult.depth === depth
    )

    // NOTE: while we only read the pass counts at a given depth, those counts already include the pass counts of their children etc.
    const passCount = testResultsAtDepth.reduce(
      (count, testResult) => count + testResult.passCount, 0
    )

    // NOTE: while we only read the total counts at a given depth, those counts already include the total counts of their children etc.
    const totalCount = testResultsAtDepth.reduce(
      (count, testResult) => count + testResult.totalCount, 0
    )

    return [
      passCount, // pass count
      totalCount - passCount, // fail count
      totalCount, // total count
    ]
  }

  const flattenedTestResults = flattenTestResults(testResults)

  const [passCount, failCount, totalCount] = testCounts(flattenedTestResults)

  return `pass: ${passCount} fail: ${failCount} total: ${totalCount} verdict: ${failCount > 0 ? '❌' : '✅'}\n` + createTable(
    flattenedTestResults,
    [
      (testResult) => {
        const icon = testResult.passed ? '✅' : '❌'
        const indentation = ' '.repeat(3 * testResult.depth)

        return [
          `${indentation}${icon} (${testResult.passCount}/${testResult.totalCount}) ${testResult.message}`,
        ]
      },
    ],
    {
      horizontalSeparator: ' ',
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
  logCurrentObj,
  forEachRemaining,
  expectRoleNames,
  expectUniqueRoleNames,
  expectAny,
  expectCategory,
  expectTextChannel,
  expectNewsChannel,
  expectVoiceChannel,
  expectStageChannel,
  expectName,
  expectPermissionsForRole,
  expectPermissions,
}
