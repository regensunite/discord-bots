const {onlyOwner} = require('../../../../../../utils/access-control/onlyOwner');
const { createOrUpdateMessage } = require('../../../../../../utils/discord/create-or-update-message');
const { getLastUpdatedMessage } = require('../../../../../../utils/last-updated');
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

await onlyOwner(context)

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
        `TODO`,
      ].join('\n\n'),
      "color": 0x295846,
    }
  ]
})
