const {onlyOwner} = require('../../../../../../utils/access-control/onlyOwner');
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

await onlyOwner(context)

// TODO: notify users that they should sign the convenant first if they haven't done so yet

await lib.discord.channels['@0.3.2'].messages.create({
  "channel_id": `${context.params.event.channel_id}`,
  "content": "",
  "tts": false,
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
