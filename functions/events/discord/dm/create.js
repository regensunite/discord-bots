const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

console.log(`message sent to bot by ${context.params.event.author.username}#${context.params.event.author.discriminator}: ${context.params.event.content}`)

// send message to user saying this bot will not reply
await lib.discord.users['@0.2.1'].dms.create({
  recipient_id: `${context.params.event.author.id}`,
  content: `Uh oh! I'm a bot and don't understand human language. Please reach out to one of our members in the Discord server: https://discord.regensunite.earth`,
});

// send message to moderators so they can intervene if needed
await lib.discord.channels['@0.3.2'].messages.create({
  channel_id: process.env.REPORT_BOT_DM__CHANNEL_ID,
  content: `DM sent to bot by <@${context.params.event.author.id}>: ${context.params.event.content}`,
})
