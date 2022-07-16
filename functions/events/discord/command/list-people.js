const {
  isBitSet,
  permissionCount,
  calculateBasePermissions,
  calculatePermissions,
  flags,
} = require('../../../../utils/discord/permissions.js')
const {
  logMemberPermissions,
} = require('../../../../utils/discord/debug-permissions.js')
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

// channel id is first value of "list-people" command
const channelId = context.params.event.data.options[0].value;

const [
  channel,
  guild,
  members,
] = await Promise.all([
  // get channel
  lib.discord.channels['@0.3.2'].retrieve({
    channel_id: `${channelId}`
  }),
  // get guild
  lib.discord.guilds['@0.2.4'].retrieve({
    guild_id: `${context.params.event.guild_id}`,
    with_counts: false
  }),
  // get guild members
  lib.discord.guilds['@0.2.4'].members.list({
    guild_id: `${context.params.event.guild_id}`,
    limit: 1000
  }),
]);

// always log to help debugging in case something goes wrong
// NOTE: marker pos 1O = VIEW_CHANNEL
logMemberPermissions(members, guild, channel, 10)

const listItems = members
  .filter(member => isBitSet(calculatePermissions(member, guild, channel), flags.VIEW_CHANNEL))
  .map(member => member.user.id)
  .map(userId => `- <@${userId}>`)

const result = await lib.discord.interactions['@1.0.1'].responses.ephemeral.create({
  token: `${context.params.event.token}`,
  content: [`the following people can read <#${channel.id}> :`].concat(listItems).join('\n')
});

return result;
