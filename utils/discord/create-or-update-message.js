const { assertDiscordId } = require("../assert");

const getLastUpdatedMessage = () => {
  const now = new Date()
  // example: last updated on August 2, 2022
  return `last updated on ${now.toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' })} ${now.getUTCDate()}, ${now.getUTCFullYear()}`
}

const createOrUpdateMessage = async (lib, channelId, messageId, payload) => {
  const isUpdate = !(messageId === undefined || messageId === null);
  const hasContent = !(payload?.content === undefined || payload?.content === null)

  // validate inputs
  assertDiscordId(channelId)
  if (isUpdate) {
    assertDiscordId(messageId)
  }

  // construct payload
  const completePayload = {
    ...payload,
    // overrides
    channel_id: channelId,
    message_id: isUpdate ? messageId : undefined,
    content: hasContent ? payload.content : `*${getLastUpdatedMessage()}*`
  }

  // execute
  if (isUpdate) {
    await lib.discord.channels['@0.3.2'].messages.update(completePayload)
  } else {
    await lib.discord.channels['@0.3.2'].messages.create(completePayload)
  }
};

module.exports = {
  createOrUpdateMessage,
}
