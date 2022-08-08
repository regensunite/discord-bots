const {onlyOwner} = require('../../../../../../utils/access-control/onlyOwner');
const { createOrUpdateMessage } = require('../../../../../../utils/discord/create-or-update-message');
const { getLastUpdatedMessage } = require('../../../../../../utils/last-updated');
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

await onlyOwner(context)

const channels = await lib.discord.guilds['@0.2.4'].channels.list({
  guild_id: `${context.params.event.guild_id}`
})

const convenantChannel = channels.find(channel => channel.name.includes('convenant'))
if (!convenantChannel) {
  throw new Error('could not find convenant channel')
}

console.log(context.params.event.content)

const channelId = context.params.event.channel_id
const messageId = context.params.event.content.split(' ')[1]?.trim()
await createOrUpdateMessage(lib, channelId, messageId, {
  "content": `*localities ${getLastUpdatedMessage()}*`,
  "embeds": [
    {
      "type": "rich",
      "title": `Join our event teams`,
      "description": [
        `Click on one of the emojis below to join a locality and help make the next Regens Unite gathering happen:`,
        `\n`,
        `\n`,
        `- 🇩🇪 **Berlin**, September 16-17, 2022`,
        `\n`,
        `- 🇳🇱 **Amsterdam**, September 22-24, 2022`,
        `\n`,
        `- 🇨🇴 **Bogota**, October 11-14, 2022`,
        `\n`,
        `- 🇧🇪 **Brussels**, May 23-27, 2023`,
        `\n`,
        `\n`,
        `💡 Please sign the <#${convenantChannel.id}> first, if you haven't done so yet, otherwise the emojis will not work.`,
      ].join(''),
      "color": 0x295846,
    }
  ]
});
