const {onlyOwner} = require('../../../../../../utils/access-control/onlyOwner');
const { createOrUpdateMessage } = require('../../../../../../utils/discord/create-or-update-message');
const { getLastUpdatedMessage } = require('../../../../../../utils/last-updated');
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

await onlyOwner(context)

const channels = await lib.discord.guilds['@0.2.4'].channels.list({
  guild_id: `${context.params.event.guild_id}`
})

const covenantChannel = channels.find(channel => channel.name.includes('covenant'))
if (!covenantChannel) {
  throw new Error('could not find covenant channel')
}

console.log(context.params.event.content)

const channelId = context.params.event.channel_id
const messageId = context.params.event.content.split(' ')[1]?.trim()
await createOrUpdateMessage(lib, channelId, messageId, {
  "content": `*circles ${getLastUpdatedMessage()}*`,
  "embeds": [
    {
      "type": "rich",
      "title": `Join our DAO circles`,
      "description": [
        `Click on one of the emojis below to join a DAO circle. The goal of each circle is to come up with proposals and make decisions in their topic area.`,
        `\n`,
        `\n`,
        `- 📡 Communication, PR and Marketing`,
        `\n`,
        `- 🌱 Events`,
        `\n`,
        `- 🔅 DAO focused`,
        `\n`,
        `\n`,
        `💡 Please sign the <#${covenantChannel.id}> first, if you haven't done so yet, otherwise the emojis will not work.`,
      ].join(''),
      "color": 0x295846,
    }
  ]
})
