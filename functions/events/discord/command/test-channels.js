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
const { activateBits, flags, ALL_PERMISSIONS } = require('../../../../utils/discord/permissions.js');
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

  // TODO now we actually have to come up with roles and sensible permissions...
  // TODO 1. play around in discord (keep in mind global everyone role, other global roles, channel sync...)
  // TODO 2. code the desired roles and permissions into the test suite
  // TODO 3. configure the server such that the test suite passes
  // TODO 4. do a few spot checks to verify that the test suite matches reality
  // TODO 5. use the "view as role" feature to test everything was configured properly

  // TODO make sure all these roles are present in the server!!!
  const roles = {
    EVERYONE: '@everyone',
    REGENS_UNITE_BOT: 'regens-unite-bot',
    MEMBER: 'member',
    BRUSSELS_GENERAL: 'brussels-general',
    BRUSSELS_FINANCE: 'brussels-general',
    BRUSSELS_FACILITATORS: 'brussels-general',
    BRUSSELS_PR: 'brussels-general',
    BRUSSELS_LOGISTICS: 'brussels-general',
    BRUSSELS_DOCS: 'brussels-general',
    BOGOTA_GENERAL: 'bogota-general',
    BOGOTA_FINANCE: 'bogota-general',
    BOGOTA_FACILITATORS: 'bogota-general',
    BOGOTA_PR: 'bogota-general',
    BOGOTA_LOGISTICS: 'bogota-general',
    BOGOTA_DOCS: 'bogota-general',
    AMSTERDAM_GENERAL: 'amsterdam-general',
    AMSTERDAM_FINANCE: 'amsterdam-general',
    AMSTERDAM_FACILITATORS: 'amsterdam-general',
    AMSTERDAM_PR: 'amsterdam-general',
    AMSTERDAM_LOGISTICS: 'amsterdam-general',
    AMSTERDAM_DOCS: 'amsterdam-general',
  }

  // NOTE: don't use directly in the tests (_ prefix)
  const _defaultFlags = [
    flags.CREATE_INSTANT_INVITE,
    flags.CHANGE_NICKNAME,
    flags.USE_EXTERNAL_EMOJIS, // NOTE: you need to have write/reaction permissions to use this permission
    flags.USE_EXTERNAL_STICKERS, // NOTE: you need to have write/reaction permissions to use this permission // TODO test this!!!
  ]

  const _readFlags = [
    flags.VIEW_CHANNEL,
    flags.READ_MESSAGE_HISTORY,
    flags.ADD_REACTIONS, // NOTE: important for reaction-roles!
  ]

  const _writeFlags = [
    flags.SEND_MESSAGES,
    flags.EMBED_LINKS,
    flags.ATTACH_FILES,
    flags.USE_APPLICATION_COMMANDS, // NOTE: in write because bot might do changes
  ]

  const _threadFlags = [
    flags.SEND_MESSAGES_IN_THREADS,
    flags.CREATE_PUBLIC_THREADS,
    flags.CREATE_PRIVATE_THREADS,
  ]

  const _voiceFlags = [
    flags.CONNECT,
    flags.SPEAK,
    flags.STREAM,
    flags.USE_EMBEDDED_ACTIVITIES,
    flags.USE_VAD,
  ]

  const _stageFlags = [
    flags.REQUEST_TO_SPEAK,
  ]

  // NOTE: don't use directly in the tests (_ prefix)
  const _defaultPermissionBitsByRole = {
    [roles.REGENS_UNITE_BOT]: ALL_PERMISSIONS,
    [roles.EVERYONE]: activateBits(0n, [
      ..._defaultFlags,
    ]),
    [roles.MEMBER]: activateBits(0n, [
      ..._defaultFlags,
    ]),
    [roles.BRUSSELS_GENERAL]: activateBits(0n, [
      ..._defaultFlags,
    ]),
    // NOTE: other roles for Brussels locality currently point to "brussels-general" as well
    [roles.BOGOTA_GENERAL]: activateBits(0n, [
      ..._defaultFlags,
    ]),
    // NOTE: other roles for Brussels locality currently point to "bogota-general" as well
    [roles.AMSTERDAM_GENERAL]: activateBits(0n, [
      ..._defaultFlags,
    ]),
    // NOTE: other roles for Brussels locality currently point to "amsterdam-general" as well
  }

  // NOTE: use these settings for ONBOARDING channels (i.e. channels that are visible before verification)
  const onboardingPermissionBitsByRole = {
    ..._defaultPermissionBitsByRole,
    [roles.EVERYONE]: activateBits(0n, [
      ..._defaultFlags,
      ..._readFlags,
    ]),
    [roles.MEMBER]: activateBits(0n, [
      ..._defaultFlags,
      ..._readFlags,
      ..._voiceFlags,
      ..._stageFlags,
    ]),

    // NOTE: permissions below are so that we don't need to reconfigure every role in the Discord settings
    //       (because we changed @everyone, which is effectively applied to all other roles, so the tests would complain about missing settings for the roles below)

    [roles.BRUSSELS_GENERAL]: activateBits(0n, [
      ..._defaultFlags,
      ..._readFlags,
    ]),
    // NOTE: other roles for Brussels locality currently point to "brussels-general" as well

    [roles.BOGOTA_GENERAL]: activateBits(0n, [
      ..._defaultFlags,
      ..._readFlags,
    ]),
    // NOTE: other roles for Brussels locality currently point to "bogota-general" as well

    [roles.AMSTERDAM_GENERAL]: activateBits(0n, [
      ..._defaultFlags,
      ..._readFlags,
    ]),
    // NOTE: other roles for Brussels locality currently point to "amsterdam-general" as well
  }

  // NOTE: use these settings for PUBLIC channels (i.e. channels that every member can read and write to)
  const publicChannelPermissionBitsByRole = {
    ..._defaultPermissionBitsByRole,
    [roles.MEMBER]: activateBits(0n, [
      ..._defaultFlags,
      ..._readFlags,
      ..._writeFlags,
      ..._threadFlags,
      ..._voiceFlags,
      ..._stageFlags,
    ]),
  }

  // NOTE: use these settings for LOCALITY channels (i.e. channels that a member can see once they joined the locality)
  const localityChannelPermissionBitsByRole = (localityRoleName) => ({
    ..._defaultPermissionBitsByRole,
    [localityRoleName]: activateBits(0n, [
      ..._defaultFlags,
      ..._readFlags,
      ..._writeFlags,
      ..._threadFlags,
      ..._voiceFlags,
      ..._stageFlags,
    ]),
  })

  // NOTE: use these settings for LOCALITY UPDATE channels (i.e. channels that every member can see, but only members of the locality can write to)
  const localityUpdateChannelPermissionBitsByRole = (localityRoleName) => ({
    ..._defaultPermissionBitsByRole,
    [roles.MEMBER]: activateBits(0n, [
      ..._defaultFlags,
      ..._readFlags,
      // NOTE: write not allowed
      ..._threadFlags,
      // NOTE: cannot modify voice permissions of text channel
      // NOTE: cannot modify stage permissions of text channel
    ]),
    [localityRoleName]: activateBits(0n, [
      ..._defaultFlags,
      ..._readFlags,
      ..._writeFlags,
      ..._threadFlags,
      ..._voiceFlags,
      ..._stageFlags,
    ]),
  })

  // NOTE: use these settings for LOCALITY VOICE channels (i.e. voice channels that every member can use)
  const localityVoiceChannelPermissionBitsByRole = (localityRoleName) => ({
    ..._defaultPermissionBitsByRole,
    [roles.MEMBER]: activateBits(0n, [
      ..._defaultFlags,
      ..._readFlags,
      ..._writeFlags,
      // NOTE: cannot modify thread permissions of voice channel
      ..._voiceFlags,
      // NOTE: cannot modify stage permissions of voice channel
    ]),
    [localityRoleName]: activateBits(0n, [
      ..._defaultFlags,
      ..._readFlags,
      ..._writeFlags,
      ..._threadFlags,
      ..._voiceFlags,
      ..._stageFlags,
    ]),
  })

  expectUniqueRoleNames()

  // category: START HERE
  expectCategory(() => {
    const startHereIcon = `👋`

    expectName(`━━ START HERE ━━`)
    expectPermissions(onboardingPermissionBitsByRole)

    expectTextChannel(() => {
      expectName(`${startHereIcon}🪂welcome`)
      expectPermissions(onboardingPermissionBitsByRole)
    })
    expectTextChannel(() => {
      expectName(`${startHereIcon}🤩introduce-yourself`)
      // NOTE: this channel is NOT visible for members that just entered discord
      expectPermissions(publicChannelPermissionBitsByRole)
    })
    expectTextChannel(() => {
      expectName(`${startHereIcon}❔info-booth`)
      expectPermissions(onboardingPermissionBitsByRole)
    })
    expectTextChannel(() => {
      expectName(`${startHereIcon}💥get-involved`)
      expectPermissions(onboardingPermissionBitsByRole)
    })
  })

  // category: MAIN GARDEN
  expectCategory(() => {
    expectName(`━━ MAIN GARDEN ━━`)
    expectPermissions(publicChannelPermissionBitsByRole)

    const mainGardenIcon = `🌱`
    expectNewsChannel(() => {
      expectName(`${mainGardenIcon}${updatesIcon}announcements`)
      expectPermissions(publicChannelPermissionBitsByRole)
    })
    expectTextChannel(() => {
      expectName(`${mainGardenIcon}${generalIcon}general`)
      expectPermissions(publicChannelPermissionBitsByRole)
    })
    expectTextChannel(() => {
      expectName(`${mainGardenIcon}🙏praise`)
      expectPermissions(publicChannelPermissionBitsByRole)
    })
    expectTextChannel(() => {
      expectName(`${mainGardenIcon}💡ideas`)
      expectPermissions(publicChannelPermissionBitsByRole)
    })
    expectTextChannel(() => {
      expectName(`${mainGardenIcon}🤝proposals`)
      // TODO special setup for proposals bot; only write in thread of each proposal?
      expectPermissions(publicChannelPermissionBitsByRole)
    })
    expectTextChannel(() => {
      expectName(`${mainGardenIcon}📸pictures`)
      expectPermissions(publicChannelPermissionBitsByRole)
    })
    expectVoiceChannel(() => {
      expectName(`${mainGardenIcon}${meetingRoomIcon}meeting-room`)
      expectPermissions(publicChannelPermissionBitsByRole)
    })
  })

  // category: BRUSSELS
  expectCategory(() => {
    expectName(`━━ BRUSSELS ━━`)
    expectPermissions(localityChannelPermissionBitsByRole(roles.BRUSSELS_GENERAL))
    
    const brusselsIcon = `🇧🇪`
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${updatesIcon}updates`)
      expectPermissions(localityUpdateChannelPermissionBitsByRole(roles.BRUSSELS_GENERAL))
    })
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${meetingNotesIcon}meeting-notes`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.BRUSSELS_GENERAL))
    })
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${generalIcon}general`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.BRUSSELS_GENERAL))
    })
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${financeIcon}finance`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.BRUSSELS_FINANCE))
    })
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${facilitatorsIcon}facilitators`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.BRUSSELS_FACILITATORS))
    })
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${prIcon}pr`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.BRUSSELS_PR))
    })
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${logisticsIcon}logistics`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.BRUSSELS_LOGISTICS))
    })
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${docsIcon}docs`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.BRUSSELS_DOCS))
    })
    expectVoiceChannel(() => {
      expectName(`${brusselsIcon}${meetingRoomIcon}meeting-room`)
      expectPermissions(localityVoiceChannelPermissionBitsByRole(roles.BRUSSELS_GENERAL))
    })
  })

  // category: BOGOTA
  expectCategory(() => {
    expectName(`━━ BOGOTA ━━`)
    expectPermissions(localityChannelPermissionBitsByRole(roles.BOGOTA_GENERAL))

    const bogotaIcon = `🇨🇴`
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${updatesIcon}updates`)
      expectPermissions(localityUpdateChannelPermissionBitsByRole(roles.BOGOTA_GENERAL))
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${meetingNotesIcon}meeting-notes`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.BOGOTA_GENERAL))
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${generalIcon}general`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.BOGOTA_GENERAL))
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${financeIcon}finance`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.BOGOTA_FINANCE))
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${facilitatorsIcon}facilitators`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.BOGOTA_FACILITATORS))
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${prIcon}pr`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.BOGOTA_PR))
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${logisticsIcon}logistics`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.BOGOTA_LOGISTICS))
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${docsIcon}docs`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.BOGOTA_DOCS))
    })
    expectVoiceChannel(() => {
      expectName(`${bogotaIcon}${meetingRoomIcon}meeting-room`)
      expectPermissions(localityVoiceChannelPermissionBitsByRole(roles.BOGOTA_GENERAL))
    })
  })

  // category: AMSTERDAM
  expectCategory(() => {
    expectName(`━━ AMSTERDAM ━━`)
    expectPermissions(localityChannelPermissionBitsByRole(roles.AMSTERDAM_GENERAL))

    const bogotaIcon = `🇳🇱`
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${updatesIcon}updates`)
      expectPermissions(localityUpdateChannelPermissionBitsByRole(roles.AMSTERDAM_GENERAL))
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${meetingNotesIcon}meeting-notes`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.AMSTERDAM_GENERAL))
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${generalIcon}general`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.AMSTERDAM_GENERAL))
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${financeIcon}finance`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.AMSTERDAM_FINANCE))
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${facilitatorsIcon}facilitators`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.AMSTERDAM_FACILITATORS))
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${prIcon}pr`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.AMSTERDAM_PR))
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${logisticsIcon}logistics`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.AMSTERDAM_LOGISTICS))
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${docsIcon}docs`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.AMSTERDAM_DOCS))
    })
    expectVoiceChannel(() => {
      expectName(`${bogotaIcon}${meetingRoomIcon}meeting-room`)
      expectPermissions(localityVoiceChannelPermissionBitsByRole(roles.AMSTERDAM_GENERAL))
    })
  })

  // TODO continue permissions here...

  // category: ADMIN
  expectCategory(() => {
    expectName(`━━ ADMIN ━━`)
    expectPermissions({
      ..._defaultPermissionBitsByRole,
    })

    expectTextChannel(() => {
      expectName(`admin-only`)
      expectPermissions({
        ..._defaultPermissionBitsByRole,
      })
    })
  })

  // category: ARCHIVE
  expectCategory(() => {
    expectName(`━━ ARCHIVE ━━`)
    expectPermissions({
      ..._defaultPermissionBitsByRole,
    })

    const archiveIcon = `🗄`
    expectTextChannel(() => {
      expectName(`${archiveIcon}${archiveIcon}explore-archive`)
      expectPermissions({
        ..._defaultPermissionBitsByRole,
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
