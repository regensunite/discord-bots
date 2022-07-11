const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

await lib.discord.users['@0.2.1'].me.status.clear();

await lib.discord.interactions['@1.0.1'].responses.ephemeral.create({
  token: `${context.params.event.token}`,
  content: `status cleared`
});

return `status cleared`