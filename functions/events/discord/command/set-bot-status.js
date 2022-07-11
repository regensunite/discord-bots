const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

const commandOptions = context.params.event.data.options

const statusOption = commandOptions.find(option => option.name === 'status')
const newStatus = statusOption?.value
console.log(`new status: ${newStatus}`);

const typeOption = commandOptions.find(option => option.name === 'type')
const newType = typeOption?.value || 'PLAYING'
console.log(`new type: ${newType}`);

// set status
await lib.discord.users['@0.2.1'].me.status.update({
  activity_name: `${newStatus}`,
  activity_type: newType,
  status: 'ONLINE'
});

await lib.discord.interactions['@1.0.1'].responses.ephemeral.create({
  token: `${context.params.event.token}`,
  content: `status set`
});

return `status set`