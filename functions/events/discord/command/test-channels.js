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
  expectUniqueRoleNames,
} = require('../../../../tests/channels.js');
const { fileDateTime } = require('../../../../utils/date.js');
const { activateBits, ALL_PERMISSIONS } = require('../../../../utils/discord/permissions.js');
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
    '@everyone': 0n,
    'regens-unite-bot': ALL_PERMISSIONS,
    'member': activateBits(0n, []),
    // TODO
  }

  expectUniqueRoleNames()
  expectCategory(() => {
    expectName(`━━ START HERE ━━`)
    expectPermissions({
      ...permissionsByRole,
    })

    const startHereIcon = `👋`
    expectTextChannel(() => {
      expectName(`${startHereIcon}🪂welcome`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${startHereIcon}🤩introduce-yourself`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${startHereIcon}❔info-booth`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${startHereIcon}💥get-involved`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
  })

  expectCategory(() => {
    expectName(`━━ MAIN GARDEN ━━`)
    expectPermissions({
      ...permissionsByRole,
    })

    const mainGardenIcon = `🌱`
    expectNewsChannel(() => {
      expectName(`${mainGardenIcon}${updatesIcon}announcements`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${mainGardenIcon}${generalIcon}general`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${mainGardenIcon}🙏praise`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${mainGardenIcon}💡ideas`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${mainGardenIcon}🤝proposals`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${mainGardenIcon}📸pictures`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectVoiceChannel(() => {
      expectName(`${mainGardenIcon}${meetingRoomIcon}meeting-room`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
  })

  expectCategory(() => {
    expectName(`━━ BRUSSELS ━━`)
    expectPermissions({
      ...permissionsByRole,
    })

    const brusselsIcon = `🇧🇪`
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${updatesIcon}updates`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${meetingNotesIcon}meeting-notes`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${generalIcon}general`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${financeIcon}finance`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${facilitatorsIcon}facilitators`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${prIcon}pr`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${logisticsIcon}logistics`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${docsIcon}docs`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectVoiceChannel(() => {
      expectName(`${brusselsIcon}${meetingRoomIcon}meeting-room`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
  })

  expectCategory(() => {
    expectName(`━━ BOGOTA ━━`)
    expectPermissions({
      ...permissionsByRole,
    })

    const bogotaIcon = `🇨🇴`
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${updatesIcon}updates`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${meetingNotesIcon}meeting-notes`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${generalIcon}general`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${financeIcon}finance`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${facilitatorsIcon}facilitators`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${prIcon}pr`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${logisticsIcon}logistics`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${docsIcon}docs`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectVoiceChannel(() => {
      expectName(`${bogotaIcon}${meetingRoomIcon}meeting-room`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
  })

  expectCategory(() => {
    expectName(`━━ AMSTERDAM ━━`)
    expectPermissions({
      ...permissionsByRole,
    })

    const bogotaIcon = `🇳🇱`
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${updatesIcon}updates`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${meetingNotesIcon}meeting-notes`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${generalIcon}general`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${financeIcon}finance`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${facilitatorsIcon}facilitators`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${prIcon}pr`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${logisticsIcon}logistics`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${docsIcon}docs`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
    expectVoiceChannel(() => {
      expectName(`${bogotaIcon}${meetingRoomIcon}meeting-room`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
  })

  expectCategory(() => {
    expectName(`━━ ADMIN ━━`)
    expectPermissions({
      ...permissionsByRole,
    })

    expectTextChannel(() => {
      expectName(`admin-only`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
  })

  expectCategory(() => {
    expectName(`━━ ARCHIVE ━━`)
    expectPermissions({
      ...permissionsByRole,
    })

    const archiveIcon = `🗄`
    expectTextChannel(() => {
      expectName(`${archiveIcon}${archiveIcon}explore-archive`)
      expectPermissions({
        ...permissionsByRole,
      })
    })
  })
})

console.log(formatTestResults(testResults))

await lib.discord.interactions['@1.0.1'].responses.ephemeral.create({
  token: `${context.params.event.token}`,
  content: `<@${context.params.event.member.user.id}> ran /${context.params.event.data.name}`,
  attachments: [
    {
      filename: `test-results_${fileDateTime(new Date())}.txt`,
      file: Buffer.from(formatTestResults(testResults)),
    },
  ],
});

// TODO use permanent message once server setup is completed
// await lib.discord.channels['@0.3.2'].messages.create({
//   channel_id: context.params.event.channel_id,
//   content: `<@${context.params.event.member.user.id}> ran /${context.params.event.data.name}`,
//   attachments: [
//     {
//       filename: `test-results_${fileDateTime(new Date())}.txt`,
//       file: Buffer.from(formatTestResults(testResults)),
//     },
//   ],
// })
