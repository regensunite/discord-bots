const { nestChannels } = require('../../../../utils/channels.js')
const {
  runChannelTests,
  formatTestResults,
  expectCategory,
  expectTextChannel,
  expectNewsChannel,
  expectVoiceChannel,
  expectName,
  expectPermissions,
} = require('../../../../tests/channels.js');
const { fileDateTime } = require('../../../../utils/date.js');
const { activateBits } = require('../../../../utils/discord/permissions.js');
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

const [
  guild,
  _rawChannels,
] = await Promise.all([
  // get guild
  lib.discord.guilds['@0.2.4'].retrieve({
    guild_id: `${context.params.event.guild_id}`,
    with_counts: false
  }),
  // get channels
  lib.discord.guilds['@0.2.4'].channels.list({
    guild_id: `${context.params.event.guild_id}`
  }),
]);

const actualChannels = nestChannels(_rawChannels)

const testResults = runChannelTests(guild, actualChannels, () => {
  const updatesIcon = `📣`
  const generalIcon = `🌈`
  const meetingRoomIcon = `🎤`
  const meetingNotesIcon = `🗒`
  const financeIcon = `🧮`
  const facilitatorsIcon = `🙋`
  const logisticsIcon = `✨`
  const docsIcon = `📗`
  const prIcon = `📤`

  // TODO role-based features that we need
  // TODO 1. visibility of channels, join a locality, join working groups within that locality
  // TODO 2. archive (category wide: "not viewable" + archive role to view archive? hopefully then original roles can stay attached as-is????? => drag and drop???)
  // TODO 3. allow certain members to self-assign admin (this will clean up the sidebar for them when they don't need to do admin work)
  // TODO 4. self-assign some tags (e.g. affinity-finance, affinity-planning, affinity-gardening, affinity-facilitating, affinity-outreach, affinity-writing...)

  // key: role name, value: permissions bits
  const permissionsByRole = {
    // TODO now we actually have to come up with roles and sensible permissions...
    // TODO 1. play around in discord (keep in mind global everyone role, other global roles, channel sync...)
    // TODO 2. code the desired roles and permissions into the test suite
    // TODO 3. configure the server such that the test suite passes
    // TODO 4. do a few spot checks to verify that the test suite matches reality
    // TODO 5. use the "view as role" feature to test everything was configured properly
    '@everyone': activateBits(0n, []),
    'regens-unite-bot': activateBits(0n, []),
    // TODO
  }

  expectCategory(() => {
    expectName(`━━ START HERE ━━`)
    expectPermissions() // TODO

    const startHereIcon = `👋`
    expectTextChannel(() => {
      expectName(`${startHereIcon}🪂welcome`)
    })
    expectTextChannel(() => {
      expectName(`${startHereIcon}🤩introduce-yourself`)
    })
    expectTextChannel(() => {
      expectName(`${startHereIcon}❔info-booth`)
    })
    expectTextChannel(() => {
      expectName(`${startHereIcon}💥get-involved`)
    })
  })

  expectCategory(() => {
    expectName(`━━ MAIN GARDEN ━━`)
    const mainGardenIcon = `🌱`
    expectNewsChannel(() => {
      expectName(`${mainGardenIcon}${updatesIcon}announcements`)
    })
    expectTextChannel(() => {
      expectName(`${mainGardenIcon}${generalIcon}general`)
    })
    expectTextChannel(() => {
      expectName(`${mainGardenIcon}🙏praise`)
    })
    expectTextChannel(() => {
      expectName(`${mainGardenIcon}💡ideas`)
    })
    expectTextChannel(() => {
      expectName(`${mainGardenIcon}🤝proposals`)
    })
    expectTextChannel(() => {
      expectName(`${mainGardenIcon}📸pictures`)
    })
    expectVoiceChannel(() => {
      expectName(`${mainGardenIcon}${meetingRoomIcon}meeting-room`)
    })
  })

  expectCategory(() => {
    expectName(`━━ BRUSSELS ━━`)
    const brusselsIcon = `🇧🇪`
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${updatesIcon}updates`)
    })
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${meetingNotesIcon}meeting-notes`)
    })
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${generalIcon}general`)
    })
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${financeIcon}finance`)
    })
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${facilitatorsIcon}facilitators`)
    })
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${prIcon}pr`)
    })
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${logisticsIcon}logistics`)
    })
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${docsIcon}docs`)
    })
    expectVoiceChannel(() => {
      expectName(`${brusselsIcon}${meetingRoomIcon}meeting-room`)
    })
  })

  expectCategory(() => {
    expectName(`━━ BOGOTA ━━`)
    const bogotaIcon = `🇨🇴`
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${updatesIcon}updates`)
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${meetingNotesIcon}meeting-notes`)
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${generalIcon}general`)
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${financeIcon}finance`)
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${facilitatorsIcon}facilitators`)
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${prIcon}pr`)
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${logisticsIcon}logistics`)
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${docsIcon}docs`)
    })
    expectVoiceChannel(() => {
      expectName(`${bogotaIcon}${meetingRoomIcon}meeting-room`)
    })
  })

  expectCategory(() => {
    expectName(`━━ AMSTERDAM ━━`)
    const bogotaIcon = `🇳🇱`
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${updatesIcon}updates`)
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${meetingNotesIcon}meeting-notes`)
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${generalIcon}general`)
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${financeIcon}finance`)
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${facilitatorsIcon}facilitators`)
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${prIcon}pr`)
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${logisticsIcon}logistics`)
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${docsIcon}docs`)
    })
    expectVoiceChannel(() => {
      expectName(`${bogotaIcon}${meetingRoomIcon}meeting-room`)
    })
  })

  expectCategory(() => {
    expectName(`━━ ADMIN ━━`)
    expectTextChannel(() => {
      expectName(`admin-only`)
    })
  })

  expectCategory(() => {
    expectName(`━━ ARCHIVE ━━`)
    const archiveIcon = `🗄`
    expectTextChannel(() => {
      expectName(`${archiveIcon}${archiveIcon}explore-archive`)
    })
  })
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
