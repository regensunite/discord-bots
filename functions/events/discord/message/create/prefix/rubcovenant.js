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
        `By clicking on the ✍🏼 emoji under this message, you agree to act within these principles:`,
        `1. All contributors are equal members and co-stewards of this commons, whether you're a visitor, contributor, or participant.`,
        `2. We practise artful participation: we contribute the best way we can to maintain and develop our common.`,
        `3. Everyone takes ownership of creating a safe and open space. This means that we're not here to convince others, nor to fight each other. Our goal is to create and learn, be curious, have fun, and support each other to share perspective.`,
        `4. We believe in collective intelligence, there are no black or white solutions and no one has a monopoly on the truth. We never take ourselves too seriously and allow ourselves to be inspired by different ways of regenerating ourselves, our communities, and the planet.`,
        `5. Everyone plays a role in creating a warm, inclusive and welcoming environment and actively seek out and enable people with different experiences and skills to contribute. We organise in a way that makes contributing as accessible as possible. We aim to be reliable so we can count on each other for help and support.`,
        `6. When together, we look to create the conditions for emergence while recognising the messiness, wonder, and challenge of being human. Being human is what unites us. This means presence, openness, and honouring silence and reflection as much as productivity and creativity. Sadness and worry have just as much of a place as joy and laughter, feminine aspects as much as masculine, and slow and small being a key part of the fractal of life.`,
        `7. We utilise minimum viable decision-making protocols to balance individual autonomy with awareness of how our decisions impact others and the commons.`,
        `8. We welcome conflict and tensions as a way to grow. We are inspired by [Ostrom's Principles for Managing a Commons](https://earthbound.report/2018/01/15/elinor-ostroms-8-rules-for-managing-the-commons/) in all ways, which includes how we respond to conflict.`,
        `By clicking on the ✍🏼 emoji below, you agree to act within these principles.`,
        // TODO
        // `6. Before making a significant decision for the commons, we seek advice and consent from our peers. Read more about our decision making protocol in channel: <#${infoBoothChannel.id}>.`,
        // `7. Our principles and protocols may evolve over time, in the same way that any other decisions are made.`,
      ].join('\n\n'),
      "color": 0x295846,
    }
  ]
})
