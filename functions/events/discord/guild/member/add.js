const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN})

const userId = context.params.event.user.id

let result = await lib.discord.users['@0.2.1'].dms.create({
  recipient_id: userId,
  content: [
    `Hey <@${userId}>, welcome to Regens Unite!`,
    `Please do not forget to sign our <#${process.env.COVENANT__CHANNEL_ID}>, in order to gain access to the community space, the local chapters and the working groups.`,
    `Once you've done that, we highly recommend that you <#${process.env.INTRODUCE_YOURSELF__CHANNEL_ID}> to break the ice. Maybe you'll find someone with common interests :slight_smile:`,
    `Our frequently asked questions and official links are always located in <#${process.env.INFO_BOOTH__CHANNEL_ID}>. This is a great place to get yourself up to speed. If anything is missing, please let us know :pray:`,
    `Lastly, in channel <#${process.env.GET_INVOLVED__CHANNEL_ID}>, you can join some of our localities and/or circles. You can also pick a few topics that are dear to you.`,
    `Welcome to the tribe and *happy regenerating*!`,
  ].join('\n\n'),
  // TODO what is regens unite?
  // TODO paragraph from: https://www.notion.so/bruno-roemers/Design-Regens-Unite-Server-V2-3c4d763b89104b908d6a97ea0850918a
  // TODO onboarding contact person?
  // TODO buddy programme?
  // TODO onboarding calls?
});

console.log(result)
