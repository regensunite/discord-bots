const {
  assertBigInt,
  assertBigIntIterable,
  assertDiscordIdIterable,
  assertPermissionString,
} = require('../assert.js')
const range = require('../range.js')

// IMPORTANT: Discord has (at least) 41 types of permissions => 41 bits
//            JavaScript numbers cannot do binary operations with more than 32 bits
//            => EVERYTHING IN THIS MODULE NEEDS TO USE BIGINT
//            BigInt docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt

const activateBits = (startingBits, flagItr) => {
  assertBigInt(startingBits)
  assertBigIntIterable(flagItr)
  return flagItr.reduce((combinedBits, flag) => combinedBits | flag, startingBits)
};

const deactivateBits = (startingBits, flagItr) => {
  assertBigInt(startingBits)
  assertBigIntIterable(flagItr)
  return flagItr.reduce((combinedBits, flag) => combinedBits & ~flag, startingBits)
}

const permissionCount = 41

// implemented as described on: https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
const _flagData = {
  CREATE_INSTANT_INVITE: {
    bitPosition: 0n,
  },
  KICK_MEMBERS: {
    bitPosition: 1n,
  },
  BAN_MEMBERS: {
    bitPosition: 2n,
  },
  ADMINISTRATOR: {
    bitPosition: 3n,
  },
  MANAGE_CHANNELS: {
    bitPosition: 4n,
  },
  MANAGE_GUILD: {
    bitPosition: 5n,
  },
  ADD_REACTIONS: {
    bitPosition: 6n,
  },
  VIEW_AUDIT_LOG: {
    bitPosition: 7n,
  },
  PRIORITY_SPEAKER: {
    bitPosition: 8n,
  },
  STREAM: {
    bitPosition: 9n,
  },
  VIEW_CHANNEL: {
    bitPosition: 10n,
  },
  SEND_MESSAGES: {
    bitPosition: 11n,
  },
  SEND_TTS_MESSAGES: {
    bitPosition: 12n,
  },
  MANAGE_MESSAGES: {
    bitPosition: 13n,
  },
  EMBED_LINKS: {
    bitPosition: 14n,
  },
  ATTACH_FILES: {
    bitPosition: 15n,
  },
  READ_MESSAGE_HISTORY: {
    bitPosition: 16n,
  },
  MENTION_EVERYONE: {
    bitPosition: 17n,
  },
  USE_EXTERNAL_EMOJIS: {
    bitPosition: 18n,
  },
  VIEW_GUILD_INSIGHTS: {
    bitPosition: 19n,
  },
  CONNECT: {
    bitPosition: 20n,
  },
  SPEAK: {
    bitPosition: 21n,
  },
  MUTE_MEMBERS: {
    bitPosition: 22n,
  },
  DEAFEN_MEMBERS: {
    bitPosition: 23n,
  },
  MOVE_MEMBERS: {
    bitPosition: 24n,
  },
  USE_VAD: {
    bitPosition: 25n,
  },
  CHANGE_NICKNAME: {
    bitPosition: 26n,
  },
  MANAGE_NICKNAMES: {
    bitPosition: 27n,
  },
  MANAGE_ROLES: {
    bitPosition: 28n,
  },
  MANAGE_WEBHOOKS: {
    bitPosition: 29n,
  },
  MANAGE_EMOJIS_AND_STICKERS: {
    bitPosition: 30n,
  },
  USE_APPLICATION_COMMANDS: {
    bitPosition: 31n,
  },
  REQUEST_TO_SPEAK: {
    bitPosition: 32n,
  },
  MANAGE_EVENTS: {
    bitPosition: 33n,
  },
  MANAGE_THREADS: {
    bitPosition: 34n,
  },
  CREATE_PUBLIC_THREADS: {
    bitPosition: 35n,
  },
  CREATE_PRIVATE_THREADS: {
    bitPosition: 36n,
  },
  USE_EXTERNAL_STICKERS: {
    bitPosition: 37n,
  },
  SEND_MESSAGES_IN_THREADS: {
    bitPosition: 38n,
  },
  USE_EMBEDDED_ACTIVITIES: {
    bitPosition: 39n,
  },
  TIMED_OUT: {
    bitPosition: 40n,
  },
}

const flags = {}
const flagsReverse = {}
const flagNames = {}
for (let flagName of Object.getOwnPropertyNames(_flagData)) {
  const bitPosition = _flagData[flagName]?.bitPosition
  assertBigInt(bitPosition)

  const flagBits = (1n << bitPosition)
  assertBigInt(flagBits)

  flags[flagName] = flagBits
  flagsReverse[flagBits] = flagName
  flagNames[flagName] = flagName
}

// NOTE: all bits turned on, except the TIMED_OUT bit
const ALL_PERMISSIONS = activateBits(0n, range(0, permissionCount - 1, 1).map(i => 1n << BigInt(i))) & (~flags.TIMED_OUT)

const isFlagSet = (bits, flag) => {
  assertBigInt(bits)
  assertBigInt(flag)
  return (bits & flag) === flag
};

const getRoleById = (roles, roleId) => {
  const role = roles.find(role => role.id === roleId)
  
  if (role === undefined) {
    throw new Error(`could not find role with id '${roleId}'`);
  }
  
  return role
}

const getRoleByName = (roles, roleName) => {
  const role = roles.find(role => role.name === roleName)
  
  if (role === undefined) {
    throw new Error(`could not find role with name '${roleName}'`);
  }
  
  return role
}

// NOTE: overwrite may not exist (undefined)
const getOverwriteById = (overwrites, overwriteId) => overwrites.find(overwrite => overwrite.id === overwriteId)

// NOTE: overwrite may not exist (undefined)
// NOTE: throws if overwrite exists but has non-role type
const getRoleOverwriteById = (overwrites, roleId) => {
  const overwrite = getOverwriteById(overwrites, roleId)

  if (overwrite && overwrite.type !== 0) {
    throw new Error(`found overwrite with id ${roleId}, but it has type ${overwrite.type}, expected type 0 (role)`)
  }

  return overwrite
}

// NOTE: overwrite may not exist (undefined)
// NOTE: throws if overwrite exists but has non-member type
const getMemberOverwriteById = (overwrites, memberId) => {
  const overwrite = getOverwriteById(overwrites, memberId)

  if (overwrite && overwrite.type !== 1) {
    throw new Error(`found overwrite with id ${memberId}, but it has type ${overwrite.type}, expected type 1 (member)`)
  }

  return overwrite
}

// implemented as described on: https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
const calculateRoleBasePermissions = (guild, roleIds) => {
  assertDiscordIdIterable(roleIds)

  // NOTE: id of @everyone role and id of guild are the same
  const everyoneRole = getRoleById(guild.roles, guild.id)

  // NOTE: start with the permissions of @everyone (baseline)
  //       and grant extra permissions based on the role(s)
  let permissions = BigInt(everyoneRole.permissions)
  for (const roleId of roleIds) {
    const role = getRoleById(guild.roles, roleId)
    permissions |= BigInt(role.permissions)
  }
  
  // NOTE: grant all permissions if ADMINISTRATOR permission is active
  if (isFlagSet(permissions, flags.ADMINISTRATOR)) {
    return ALL_PERMISSIONS
  }

  return permissions
}

// implemented as described on: https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
const calculateBasePermissionsForMember = (member, guild) => {
  if (member.user.id === guild.owner_id) {
    // NOTE: owner can do everything in the server
    return ALL_PERMISSIONS
  }
  
  return calculateRoleBasePermissions(guild, member.roles)
};

// implemented as described on: https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
const calculateRoleOverwrites = (basePermissions, channel, roleIds) => {
  assertBigInt(basePermissions)
  assertDiscordIdIterable(roleIds)

  // NOTE: ADMINISTRATOR wins from any overrides
  if (isFlagSet(basePermissions, flags.ADMINISTRATOR)) {
    return ALL_PERMISSIONS
  }

  let permissions = basePermissions

  // overwrites that apply to everyone
  // NOTE: id of @everyone role and id of guild are the same
  const everyoneOverwrite = getRoleOverwriteById(channel.permission_overwrites, channel.guild_id)
  if (everyoneOverwrite) {
    permissions &= ~BigInt(everyoneOverwrite.deny)
    permissions |= BigInt(everyoneOverwrite.allow)
  }

  // overwrites that apply to the role(s)
  for (const roleId of roleIds) {
    const roleOverwrite = getRoleOverwriteById(channel.permission_overwrites, roleId)
    if (roleOverwrite) {
      permissions &= ~BigInt(roleOverwrite.deny)
      permissions |= BigInt(roleOverwrite.allow)
    }
  }

  return permissions
}

// implemented as described on: https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
const calculateFinalOverwrites = (basePermissions, member, channel) => {
  let permissions = calculateRoleOverwrites(basePermissions, channel, member.roles)
  
  // overwrites that apply to the member directly
  const memberOverwrite = getMemberOverwriteById(channel.permission_overwrites, member.user.id)
  if (memberOverwrite) {
    permissions &= ~BigInt(memberOverwrite.deny)
    permissions |= BigInt(memberOverwrite.allow)
  }
  
  return permissions
};

// implemented as described on: https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
const calculatePermissions = (member, guild, channel) => {
  const basePermissions = calculateBasePermissionsForMember(member, guild)
  return calculateFinalOverwrites(basePermissions, member, channel)
};

const permissionBitsToString = (permissionBits, length) => {
  assertBigInt(permissionBits)
  return permissionBits.toString(2).padStart(length, '0')
}

// take a string comprising of only 1s and 0s (e.g. 101100) and turn it into a bigint (e.g. 44n)
const permissionStringToBits = (str) => {
  assertPermissionString(str)
  let bits = 0n
  for (let i = 0; i < str.length; i++) {
    // take next char from the back of the string
    const char = str[str.length - 1 - i]
    if (char === '1') {
      bits |= 1n << BigInt(i)
    }
  }
  return bits
}

// get a list of flag names that have been set in bits (bigint)
// example: bits = 1011 => [ CREATE_INSTANT_INVITE, KICK_MEMBERS, ADMINISTRATOR ]
const getPermissionNames = (bits) => {
  assertBigInt(bits)

  const permissionNames = []

  // loop example when bits = 110:
  // - 0001
  // - 0010
  // - 0100
  // - 1000 => bigger than bits, so loop breaks
  for (let flag = 1n; flag <= bits; flag = (flag << 1n)) {
    if (isFlagSet(bits, flag)) {
      const flagName = flagsReverse[flag] || '<unknown>'
      permissionNames.push(flagName)
    }
  }

  return permissionNames
}

// get a string detailing which flags should be added to actualBits, and which flags should be removed
// example: actualBits = 1000, expectedBits = 0101 => to be removed: ADMINISTRATOR; to be added: CREATE_INSTANT_INVITE, BAN_MEMBERS
const diffPermissionBits = (actualBits, expectedBits) => {
  assertBigInt(actualBits)
  assertBigInt(expectedBits)

  // bits that are different (XOR)
  const diffBits = actualBits ^ expectedBits
  if (diffBits === 0n) {
    return '<equal>'
  }

  // bits that are in actual, but not in expected
  const bitsToBeRemoved = diffBits & actualBits
  const flagsToBeRemoved = getPermissionNames(bitsToBeRemoved)
  const toBeRemovedStr = flagsToBeRemoved.length <= 0 ? '<none>' : flagsToBeRemoved.join(', ')

  // bits that are in expected, but not in actual
  const bitsToBeAdded = diffBits & expectedBits
  const flagsToBeAdded = getPermissionNames(bitsToBeAdded)
  const toBeAddedStr = flagsToBeAdded.length <= 0 ? '<none>' : flagsToBeAdded.join(', ')

  return `to be removed: ${toBeRemovedStr}; to be added: ${toBeAddedStr}`
}

module.exports = {
  activateBits,
  deactivateBits,
  permissionCount,
  flags,
  flagsReverse,
  flagNames,
  ALL_PERMISSIONS,
  isFlagSet,
  getRoleById,
  getRoleByName,
  getOverwriteById,
  calculateRoleBasePermissions,
  calculateBasePermissionsForMember,
  calculateRoleOverwrites,
  calculateFinalOverwrites,
  calculatePermissions,
  permissionBitsToString,
  permissionStringToBits,
  getPermissionNames,
  diffPermissionBits,
}
