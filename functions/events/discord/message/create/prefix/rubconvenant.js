const {onlyOwner} = require('../../../../../../utils/access-control/onlyOwner');
const { createOrUpdateMessage } = require('../../../../../../utils/discord/create-or-update-message');
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

await onlyOwner(context)

const channels = await lib.discord.guilds['@0.2.4'].channels.list({
  guild_id: `${context.params.event.guild_id}`
})

const infoBoothChannel = channels.find(channel => channel.name.includes('info-booth'))
if (!infoBoothChannel) {
  throw new Error('could not find info-booth channel')
}

console.log(context.params.event.content)

const channelId = context.params.event.channel_id
const messageId = context.params.event.content.split(' ')[1]?.trim()
await createOrUpdateMessage(lib, channelId, messageId, {
  "embeds": [
    {
      "type": "rich",
      "title": `The Regens Unite Commons`,
      "description": [
        // TODO
        `By clicking on the ✍🏼 emoji under this message, you agree to act within these principles:`,
        `1. We are all members and co-owners of this common, so we all contribute in the best way we can to maintain and develop it. We practice artful participation.`,
        `2. We take ownership of creating a safe and brave space that supports vulnerability and intimacy. At the same time, we allow room for experimentation and learning new skills.`,
        `3. We honor silence and reflection as much as energy and creativity, feminine aspects as much as masculine, and we recognise slow and small being a key part of the fractal of life.`,
        `4. We look to create conditions for emergence, while recognising the messiness, wonder and challenge of being human and looking to create unity. We also allow ourselves to be surprised and awed by all the different ways of being regenerative.`,
        `5. There are no right or wrong answers to be found here, and no black or white solutions.`,
        `6. Before making a significant decision for the commons, we seek advice and consent from our peers. Read more about our decision making protocol in channel: <#${infoBoothChannel.id}>.`,
        `7. Our principles and protocols may evolve over time, in the same way that any other decisions are made.`,
        `By clicking on the ✍🏼 emoji below, you agree to act within these principles.`
      ].join('\n\n'),
      "color": 0x295846,
    }
  ]
})
