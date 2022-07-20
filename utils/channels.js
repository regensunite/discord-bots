// docs see: https://discord.com/developers/docs/resources/channel#channel-object-channel-types
const ignoredChannelTypes = [
  1, // DM
  3, // GROUP_DM
  10, // GUILD_NEWS_THREAD
  11, // GUILD_PUBLIC_THREAD
  12, // GUILD_PRIVATE_THREAD
  14, // GUILD_DIRECTORY
  15, // GUILD_FORUM
]
// => NOT ignored: GUILD_TEXT, GUILD_VOICE, GUILD_CATEGORY, GUILD_NEWS, GUILD_STAGE_VOICE

const CATEGORY_TYPE = 4

const textChannelTypes = [
  0, // GUILD_TEXT
  5, // GUILD_NEWS
]

const voiceChannelTypes = [
  2, // GUILD_VOICE
  13, // GUILD_STAGE_VOICE
]

const typeToStr = (channelType) => {
  switch(channelType) {
    case 0:
      return 'TEXT CHANNEL'
    case 5:
      return 'NEWS CHANNEL'
    case 2:
      return 'VOICE CHANNEL'
    case 13:
      return 'STAGE CHANNEL'
    case 4:
      return 'CATEGORY'
    default:
      throw new Error(`channel type ${channelType} is not supported`)
  }
}

const naturalOrderChannels = (channel1, channel2) => {
  // text channels appear always above voice channels
  if (textChannelTypes.includes(channel1.type) && voiceChannelTypes.includes(channel2.type)) {
    return -1
  }
  if (voiceChannelTypes.includes(channel1.type) && textChannelTypes.includes(channel2.type)) {
    return 1
  }
  
  // order by position within type
  return channel1.position - channel2.position
}

const nestChannels = (_rawChannels) => {
  // filter out all channel types that we do not care about
  const channels = _rawChannels.filter(channel => !ignoredChannelTypes.includes(channel.type))
  
  // NOTE: for all intents and purposes, everything that's NOT a category is a channel
  // NOTE: top-level channels don't have a parent id
  const topLevelChannels = channels
    .filter(channel => channel.type !== CATEGORY_TYPE && channel.parent_id === null)
    .sort(naturalOrderChannels)
  
  // NOTE: categories cannot have parents
  const categories = channels
    .filter(channel => channel.type === CATEGORY_TYPE && channel.parent_id === null)
    .sort(naturalOrderChannels)
  
  // NOTE: for all intents and purposes, everything that's NOT a category is a channel
  // NOTE: child channels do have a parent id
  const childChannels = channels
    .filter(channel => channel.type !== CATEGORY_TYPE && channel.parent_id !== null)
    .sort(naturalOrderChannels)
  
  const hierarchy = [
    ...topLevelChannels,
    ...categories
      .map(category => ({
        ...category,
        _children: childChannels.filter(channel => channel.parent_id === category.id)
      }))
  ]
  
  // sanity check
  const lengthCheck = hierarchy.length + hierarchy.reduce((sum, category) => category._children === undefined ? sum : sum + category._children.length, 0)
  if (channels.length !== lengthCheck) {
    throw new Error(`received ${channels.length} (filtered) channels, but hierarchy contains ${lengthCheck} channels`);
  }
  
  return hierarchy
}

const getChannelByName = (channels, channelName, type = undefined) => {
  const channel = channels.find(channel => channel.name === channelName)
  
  if (channel === undefined) {
    throw new Error(`could not find channel with name '${channelName}'`);
  }

  if (type !== undefined && channel.type !== type) {
    throw new Error(`channel with name ${channel.name} has type ${channel.type} (${typeToStr(channel.type)}), expected type ${type} (${typeToStr(type)})`)
  }
  
  return channel
}

module.exports = {
  CATEGORY_TYPE,
  nestChannels,
  typeToStr,
  getChannelByName,
}
