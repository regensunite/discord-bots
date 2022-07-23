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
  expectRoleNames,
  expectStageChannel,
} = require('../../../../tests/channels.js');
const { fileDateTime } = require('../../../../utils/date.js');
const { activateBits, flags, ALL_PERMISSIONS } = require('../../../../utils/discord/permissions.js');
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

// TODO code quality & best practices:
// TODO - send ephemeral response ASAP, then update once results are ready
// TODO - use try-catch block to send response when something goes wrong

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
  const financeIcon = `🧮`
  const facilitatorsIcon = `🙋`
  const logisticsIcon = `✨`
  const communicationIcon = `📡`

  const roles = {
    EVERYONE: '@everyone',
    REGENS_UNITE_BOT: 'regens-unite-bot',
    CARL_BOT: 'carl-bot',
    MEMBER: 'member',
    ADMIN: 'admin', // NOTE: regular admin; doesn't have admin permissions by default, but can self-(un)assign the 'sudo' role
    SUDO: 'sudo', // NOTE: regular admin operating with elevated rights
    SUPER_ADMIN: 'super-admin', // NOTE: permanent admin rights
    VIEWING_ARCHIVE: 'viewing-archive', // NOTE: role to view the archive (self-assignable by members)
    BRUSSELS_GENERAL: 'brussels-general',
    BRUSSELS_FINANCE: 'brussels-general',
    BRUSSELS_FACILITATORS: 'brussels-general',
    BRUSSELS_COMMUNICATION: 'brussels-general',
    BRUSSELS_LOGISTICS: 'brussels-general',
    BOGOTA_GENERAL: 'bogota-general',
    BOGOTA_FINANCE: 'bogota-general',
    BOGOTA_FACILITATORS: 'bogota-general',
    BOGOTA_COMMUNICATION: 'bogota-general',
    BOGOTA_LOGISTICS: 'bogota-general',
    AMSTERDAM_GENERAL: 'amsterdam-general',
    AMSTERDAM_FINANCE: 'amsterdam-general',
    AMSTERDAM_FACILITATORS: 'amsterdam-general',
    AMSTERDAM_COMMUNICATION: 'amsterdam-general',
    AMSTERDAM_LOGISTICS: 'amsterdam-general',
  }

  // NOTE: don't use directly in the tests (_ prefix)
  const _defaultFlags = [
    flags.CREATE_INSTANT_INVITE,
    flags.CHANGE_NICKNAME,
    flags.USE_EXTERNAL_EMOJIS, // NOTE: you need to have write/reaction permissions to use this permission
    flags.USE_EXTERNAL_STICKERS, // NOTE: you need to have write/reaction permissions to use this permission
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
    [roles.CARL_BOT]: ALL_PERMISSIONS,
    [roles.SUPER_ADMIN]: ALL_PERMISSIONS,
    [roles.SUDO]: ALL_PERMISSIONS,
    [roles.ADMIN]: activateBits(0n, [
      ..._defaultFlags,
    ]),
    [roles.VIEWING_ARCHIVE]: activateBits(0n, [
      ..._defaultFlags,
    ]),
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
  const onboardingChannelPermissionBitsByRole = {
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

    [roles.ADMIN]: activateBits(0n, [
      ..._defaultFlags,
      ..._readFlags,
    ]),

    [roles.VIEWING_ARCHIVE]: activateBits(0n, [
      ..._defaultFlags,
      ..._readFlags,
    ]),

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

  // NOTE: use these settings for PROJECT channels
  const projectChannelPermissionBitsByRole = {
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

  // NOTE: use these settings for UTILITY channels
  const breakoutChannelPermissionBitsByRole = {
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

  // NOTE: use these settings for ADMIN channels
  const adminChannelPermissionBitsByRole = {
    ..._defaultPermissionBitsByRole,
    [roles.ADMIN]: activateBits(0n, [
      ..._defaultFlags,
      ..._readFlags,
      ..._writeFlags,
      ..._threadFlags,
      ..._voiceFlags,
      ..._stageFlags,
    ]),
    // NOTE: no need to configure sudo and super admin here, they already have all permissions
  }

  // NOTE: use these settings for ARCHIVED channels
  const archiveChannelPermissionBitsByRole = {
    ..._defaultPermissionBitsByRole,
    [roles.VIEWING_ARCHIVE]: activateBits(0n, [
      ..._defaultFlags,
      ..._readFlags,
    ]),
  }

  // NOTE/ uste these settings for the EXPLORE ARCHIVE channel
  const exploreArchiveChannelPermissionBitsByRole = {
    ..._defaultPermissionBitsByRole,
    [roles.MEMBER]: activateBits(0n, [
      ..._defaultFlags,
      ..._readFlags,
    ]),
  }

  // NOTE: filter out duplicates, so that keys of the roles object can point to the same roles, if desired
  expectRoleNames([...new Set(Object.values(roles))])
  expectUniqueRoleNames()

  // category: START HERE
  expectCategory(() => {
    const startHereIcon = `👋`

    expectName(`━━ START HERE ━━`)
    expectPermissions(onboardingChannelPermissionBitsByRole)

    expectTextChannel(() => {
      expectName(`${startHereIcon}🪂welcome`)
      expectPermissions(onboardingChannelPermissionBitsByRole)
      // TODO give each channel a description and test for it?
    })
    expectTextChannel(() => {
      expectName(`${startHereIcon}🤩introduce-yourself`)
      // NOTE: this channel is NOT visible for members that just entered discord
      expectPermissions(publicChannelPermissionBitsByRole)
    })
    expectTextChannel(() => {
      expectName(`${startHereIcon}❔info-booth`)
      expectPermissions(onboardingChannelPermissionBitsByRole)
    })
    expectTextChannel(() => {
      expectName(`${startHereIcon}💥get-involved`)
      expectPermissions(onboardingChannelPermissionBitsByRole)
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
    expectTextChannel(() => {
      expectName(`${mainGardenIcon}📗notes-docs-links`)
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
      expectName(`${brusselsIcon}${communicationIcon}communication`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.BRUSSELS_COMMUNICATION))
    })
    expectTextChannel(() => {
      expectName(`${brusselsIcon}${logisticsIcon}logistics`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.BRUSSELS_LOGISTICS))
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
      expectName(`${bogotaIcon}${communicationIcon}communication`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.BOGOTA_COMMUNICATION))
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${logisticsIcon}logistics`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.BOGOTA_LOGISTICS))
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
      expectName(`${bogotaIcon}${communicationIcon}communication`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.AMSTERDAM_COMMUNICATION))
    })
    expectTextChannel(() => {
      expectName(`${bogotaIcon}${logisticsIcon}logistics`)
      expectPermissions(localityChannelPermissionBitsByRole(roles.AMSTERDAM_LOGISTICS))
    })
    expectVoiceChannel(() => {
      expectName(`${bogotaIcon}${meetingRoomIcon}meeting-room`)
      expectPermissions(localityVoiceChannelPermissionBitsByRole(roles.AMSTERDAM_GENERAL))
    })
  })

  // category: PROJECTS
  expectCategory(() => {
    expectName(`━━ PROJECTS ━━`)
    expectPermissions(projectChannelPermissionBitsByRole)

    const projectsIcon = `🔥`
    expectTextChannel(() => {
      expectName(`${projectsIcon}💭discord-changes`)
      expectPermissions(projectChannelPermissionBitsByRole)
    })
    expectTextChannel(() => {
      expectName(`${projectsIcon}🔅decision-protocol`)
      expectPermissions(projectChannelPermissionBitsByRole)
    })
    expectTextChannel(() => {
      expectName(`${projectsIcon}📝regen-journal`)
      expectPermissions(projectChannelPermissionBitsByRole)
    })
    expectTextChannel(() => {
      expectName(`${projectsIcon}🎙regen-radio`)
      expectPermissions(projectChannelPermissionBitsByRole)
    })
    expectTextChannel(() => {
      expectName(`${projectsIcon}📗handbook`)
      expectPermissions(projectChannelPermissionBitsByRole)
    })
  })

  // category: BREAKOUT ROOMS
  expectCategory(() => {
    expectName(`━━ BREAKOUT ROOMS ━━`)
    expectPermissions(breakoutChannelPermissionBitsByRole)

    const breakoutIcon = `🏡`
    expectStageChannel(() => {
      expectName(`${breakoutIcon}🍿main-stage`)
      expectPermissions(breakoutChannelPermissionBitsByRole)
    })
    expectVoiceChannel(() => {
      expectName(`${breakoutIcon}🎤voice-1`)
      expectPermissions(breakoutChannelPermissionBitsByRole)
    })
    expectVoiceChannel(() => {
      expectName(`${breakoutIcon}🎤voice-2`)
      expectPermissions(breakoutChannelPermissionBitsByRole)
    })
    expectVoiceChannel(() => {
      expectName(`${breakoutIcon}🎤voice-3`)
      expectPermissions(breakoutChannelPermissionBitsByRole)
    })
    expectVoiceChannel(() => {
      expectName(`${breakoutIcon}🎤voice-4`)
      expectPermissions(breakoutChannelPermissionBitsByRole)
    })
    expectVoiceChannel(() => {
      expectName(`${breakoutIcon}🎤voice-5`)
      expectPermissions(breakoutChannelPermissionBitsByRole)
    })
  })

  // category: ADMIN
  expectCategory(() => {
    expectName(`━━ ADMIN ━━`)
    expectPermissions(adminChannelPermissionBitsByRole)

    // TODO sudo channel?

    expectTextChannel(() => {
      expectName(`admin-only`)
      expectPermissions(adminChannelPermissionBitsByRole)
    })
  })

  // category: ARCHIVE
  expectCategory(() => {
    expectName(`━━ ARCHIVE ━━`)
    expectPermissions(archiveChannelPermissionBitsByRole)

    const archiveIcon = `🗄`
    expectTextChannel(() => {
      expectName(`${archiveIcon}${archiveIcon}explore-archive`)
      // NOTE: this channel needs to be read-only by members, such that they can visit the archive
      expectPermissions(exploreArchiveChannelPermissionBitsByRole)
    })
    expectTextChannel(() => {
      expectName(`${archiveIcon}${archiveIcon}test-archived-channel`)
      expectPermissions(archiveChannelPermissionBitsByRole)
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
