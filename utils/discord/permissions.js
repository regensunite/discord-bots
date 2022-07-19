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
const flags = {
  CREATE_INSTANT_INVITE: (1n << 0n),
  KICK_MEMBERS: (1n << 1n),
  BAN_MEMBERS: (1n << 2n),
  ADMINISTRATOR: (1n << 3n),
  MANAGE_CHANNELS: (1n << 4n),
  MANAGE_GUILD: (1n << 5n),
  ADD_REACTIONS: (1n << 6n),
  VIEW_AUDIT_LOG: (1n << 7n),
  PRIORITY_SPEAKER: (1n << 8n),
  STREAM: (1n << 9n),
  VIEW_CHANNEL: (1n << 10n),
  SEND_MESSAGES: (1n << 11n),
  SEND_TTS_MESSAGES: (1n << 12n),
  MANAGE_MESSAGES: (1n << 13n),
  EMBED_LINKS: (1n << 14n),
  ATTACH_FILES: (1n << 15n),
  READ_MESSAGE_HISTORY: (1n << 16n),
  MENTION_EVERYONE: (1n << 17n),
  USE_EXTERNAL_EMOJIS: (1n << 18n),
  VIEW_GUILD_INSIGHTS: (1n << 19n),
  CONNECT: (1n << 20n),
  SPEAK: (1n << 21n),
  MUTE_MEMBERS: (1n << 22n),
  DEAFEN_MEMBERS: (1n << 23n),
  MOVE_MEMBERS: (1n << 24n),
  USE_VAD: (1n << 25n),
  CHANGE_NICKNAME: (1n << 26n),
  MANAGE_NICKNAMES: (1n << 27n),
  MANAGE_ROLES: (1n << 28n),
  MANAGE_WEBHOOKS: (1n << 29n),
  MANAGE_EMOJIS_AND_STICKERS: (1n << 30n),
  USE_APPLICATION_COMMANDS: (1n << 31n),
  REQUEST_TO_SPEAK: (1n << 32n),
  MANAGE_EVENTS: (1n << 33n),
  MANAGE_THREADS: (1n << 34n),
  CREATE_PUBLIC_THREADS: (1n << 35n),
  CREATE_PRIVATE_THREADS: (1n << 36n),
  USE_EXTERNAL_STICKERS: (1n << 37n),
  SEND_MESSAGES_IN_THREADS: (1n << 38n),
  USE_EMBEDDED_ACTIVITIES: (1n << 39n),
  TIMED_OUT: (1n << 40n),
};

// NOTE: all bits turned on, except the TIMED_OUT bit
const ALL_PERMISSIONS = activateBits(0n, range(0, permissionCount - 1, 1).map(i => 1n << BigInt(i))) & (~flags.TIMED_OUT)

const isBitSet = (bits, mask) => {
  assertBigInt(bits)
  assertBigInt(mask)
  return (bits & mask) === mask
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
}

// NOTE: overwrite may not exist (undefined)
// NOTE: throws if overwrite exists but has non-member type
const getMemberOverwriteById = (overwrites, memberId) => {
  const overwrite = getOverwriteById(overwrites, memberId)
  if (overwrite && overwrite.type !== 1) {
    throw new Error(`found overwrite with id ${memberId}, but it has type ${overwrite.type}, expected type 1 (member)`)
  }
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
  if (isBitSet(permissions, flags.ADMINISTRATOR)) {
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
  if (isBitSet(basePermissions, flags.ADMINISTRATOR)) {
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

const permissionBitsToString = (permissionBits, length = permissionCount) => {
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

module.exports = {
  activateBits,
  deactivateBits,
  permissionCount,
  flags,
  ALL_PERMISSIONS,
  isBitSet,
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
}
