const { nestChannels } = require('../../../../utils/channels.js')
const {
  runChannelTests,
  formatTestOutputs,
  expectCategory,
  expectTextChannel,
  expectName,
} = require('../../../../tests/channels.js')
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

const [
  _rawChannels
] = await Promise.all([
  lib.discord.guilds['@0.2.4'].channels.list({
    guild_id: `${context.params.event.guild_id}`
  }),
]);

const actualChannels = nestChannels(_rawChannels)

const testResults = runChannelTests(actualChannels, () => {
  // TODO continue test cases
  
  expectTextChannel(() => {})
  expectTextChannel(() => {})
  expectTextChannel(() => {})
  expectTextChannel(() => {})
  expectCategory(() => {})
  expectCategory(() => {
    // TODO main
    expectTextChannel(() => {})
    expectTextChannel(() => {})
  })
  expectCategory(() => {
    // TODO bxl
    expectTextChannel(() => {})
    expectTextChannel(() => {})
    expectTextChannel(() => {})
    expectTextChannel(() => {})
    expectTextChannel(() => {})
  })
  expectCategory(() => {
    // TODO ams
    expectTextChannel(() => {})
  })
  expectCategory(() => {})
  expectCategory(() => {})
})

// TODO
console.log(formatTestOutputs(testResults))

// TODO
return

await lib.discord.channels['@0.3.2'].messages.create({
  "channel_id": `${context.params.event.channel_id}`,
  "content": `<@${context.params.event.member.user.id}> ran /${context.params.event.data.name}`,
  "tts": false,
  "embeds": [
    {
      "type": "rich",
      "title": `Test Results`,
      "description": table,
      "color": 0xff0000, // TODO red if fail, green if success
    }
  ]
});
