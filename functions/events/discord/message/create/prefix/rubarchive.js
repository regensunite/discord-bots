const {onlyOwner} = require('../../../../../../utils/access-control/onlyOwner');
const { createOrUpdateMessage } = require('../../../../../../utils/discord/create-or-update-message');
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

await onlyOwner(context)

console.log(context.params.event.content)

const channelId = context.params.event.channel_id
const messageId = context.params.event.content.split(' ')[1]?.trim()
await createOrUpdateMessage(lib, channelId, messageId, {
  "embeds": [
    {
      "type": "rich",
      "title": `Toggle Archive Visibility`,
      "description": [
        `Use the 🗄️ emoji to show/hide the archived channels (from the previous Discord layout)`
      ].join('\n\n'),
      "color": 0x295846,
    }
  ]
})
