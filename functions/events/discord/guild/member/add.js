const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN})

const userId = context.params.event.user.id

let result = await lib.discord.users['@0.2.1'].dms.create({
  recipient_id: userId,
  content: `hello <@${userId}>!`,
});

console.log(result)
