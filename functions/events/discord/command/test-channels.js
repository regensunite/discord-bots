const { nestChannels } = require('../../../../utils/channels.js')
const {
  runChannelTests,
  formatTestResults,
  expectCategory,
  expectTextChannel,
  expectNewsChannel,
  expectVoiceChannel,
  expectStageChannel,
  expectName,
} = require('../../../../tests/channels.js');
const { fileDateTime } = require('../../../../utils/date.js');
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
    // expectName('aaa')
    expectName('━━ Main Garden ━━')

    expectTextChannel(() => {})
    expectTextChannel(() => {})
  })
  expectCategory(() => {
    // TODO bxl
    expectNewsChannel(() => {})
    expectTextChannel(() => {})
    expectTextChannel(() => {})
    expectStageChannel(() => {})
    expectVoiceChannel(() => {})
  })
  expectCategory(() => {
    // TODO ams
    expectTextChannel(() => {})
  })
  expectCategory(() => {})
  expectCategory(() => {})
})

console.log(formatTestResults(testResults))

await lib.discord.channels['@0.3.2'].messages.create({
  channel_id: context.params.event.channel_id,
  content: `<@${context.params.event.member.user.id}> ran /${context.params.event.data.name}`,
  attachments: [
    {
      filename: `test-results_${fileDateTime(new Date())}.txt`,
      file: Buffer.from(formatTestResults(testResults)),
    },
  ],
})
