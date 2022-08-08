const getLastUpdatedMessage = () => {
  const now = new Date()
  // example: last updated on August 2, 2022
  return `last updated on ${now.toLocaleString('en-GB', { month: 'long', timeZone: 'UTC' })} ${now.getUTCDate()}, ${now.getUTCFullYear()}`
}

module.exports = {
  getLastUpdatedMessage
}
