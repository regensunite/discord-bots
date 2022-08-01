const {onlyOwner} = require('../../../../../../utils/access-control/onlyOwner');
const { createOrUpdateMessage } = require('../../../../../../utils/discord/create-or-update-message');
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

await onlyOwner(context)

// TODO: notify users that they should sign the convenant first if they haven't done so yet

console.log(context.params.event.content)

const channelId = context.params.event.channel_id
const messageId = context.params.event.content.split(' ')[1]?.trim()
await createOrUpdateMessage(lib, channelId, messageId, {
  "embeds": [
    {
      "type": "rich",
      "title": `Get Involved`,
      "description": [
        `Click on one of the emojis below to join a locality and help make the next Regens Unite gathering happen:`,
        `\n`,
        `- 🇳🇱 Amsterdam, September 2022`,
        `\n`,
        `- 🇨🇴 Bogota, October 2022`,
        `\n`,
        `- 🇧🇪 Brussels, May 2023`,
      ].join(''),
      "color": 0x295846,
    }
  ]
});
