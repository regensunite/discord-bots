const { compareStr } = require('../compare.js')
const {
  permissionBitsToString,
  calculateBasePermissions,
  calculateFinalOverwrites,
} = require('./permissions.js')
const { createTable } = require('../table.js')
const { markFromEnd } = require('../mark.js')

const logMemberPermissions = (members, guild, channel, markerPos) => {
  const rows = members.sort((m1, m2) => compareStr(m1.user.username, m2.user.username))
  const tableStr = createTable(rows, [
    // column 1: member name
    (member) => [`${member.user.username}`],
    // column 2: type
    (member) => [
      `base`,
      `channel`,
    ],
    // column 3: bits
    (member) => {
      const basePermissions = calculateBasePermissions(member, guild)
      const channelPermissions = calculateFinalOverwrites(basePermissions, member, channel)
      return [
        `${markFromEnd(permissionBitsToString(basePermissions), markerPos)}`,
        `${markFromEnd(permissionBitsToString(channelPermissions), markerPos)}`,
      ]
    },
    // column 4: member roles
    (member) => [`${member.roles}`],
  ])
  console.log(tableStr);
}

module.exports = {
  logMemberPermissions,
}
