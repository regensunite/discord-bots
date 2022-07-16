const {
  assertBigInt,
  assertBigIntIterable,
  assertDiscordIdIterable,
} = require('../assert.js')
const range = require('../range.js')

// IMPORTANT: Discord has (at least) 41 types of permissions => 41 bits
//            JavaScript numbers cannot do binary operations with more than 32 bits
//            => EVERYTHING IN THIS MODULE NEEDS TO USE BIGINT
//            BigInt docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt

const activateBits = (startingBits, flagItr) => {
  assertBigInt(startingBits)
  assertBigIntIterable(flagItr)
  return flagItr.reduce((combinedBits, currentBits) => combinedBits | currentBits, startingBits)
};

const permissionCount = 41

// implemented as described on: https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags
const flags = {
  // TODO add missing flags
  ADMINISTRATOR: (1n << 3n),
  VIEW_CHANNEL: (1n << 10n),
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
const calculateBasePermissions = (member, guild) => {
  if (member.user.id === guild.owner_id) {
    // NOTE: owner can do everything in the server
    return ALL_PERMISSIONS
  }
  
  // NOTE: id of @everyone role and id of guild are the same
  const everyoneRole = getRoleById(guild.roles, guild.id)
  
  // NOTE: start with the permissions of @everyone (baseline)
  //       and grant extra permissions based on the member's roles
  let permissions = BigInt(everyoneRole.permissions)
  for (const roleId of member.roles) {
    const role = getRoleById(guild.roles, roleId)
    permissions |= BigInt(role.permissions)
  }
  
  // NOTE: grant all permissions if member is an ADMINISTRATOR
  if (isBitSet(permissions, flags.ADMINISTRATOR)) {
    return ALL_PERMISSIONS
  }
  
  return permissions
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
  const basePermissions = calculateBasePermissions(member, guild)
  return calculateFinalOverwrites(basePermissions, member, channel)
};

const permissionBitsToString = (permissionBits, length = permissionCount) => {
  assertBigInt(permissionBits)
  return permissionBits.toString(2).padStart(length, '0')
}

module.exports = {
  activateBits,
  permissionCount,
  flags,
  ALL_PERMISSIONS,
  isBitSet,
  getRoleById,
  getOverwriteById,
  calculateBasePermissions,
  calculateRoleOverwrites,
  calculateFinalOverwrites,
  calculatePermissions,
  permissionBitsToString,
}
