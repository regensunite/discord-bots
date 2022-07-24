const {onlyOwner} = require('../../../../../../utils/access-control/onlyOwner');
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

await onlyOwner(context)

await lib.discord.channels['@0.3.2'].messages.create({
  "channel_id": `${context.params.event.channel_id}`,
  "content": "",
  "tts": false,
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
});
