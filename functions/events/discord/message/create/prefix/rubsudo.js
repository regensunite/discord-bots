const {onlyOwner} = require('../../../../../../utils/access-control/onlyOwner');
const { createOrUpdateMessage } = require('../../../../../../utils/discord/create-or-update-message');
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

await onlyOwner(context)

const [
  guild,
  channels,
] = await Promise.all([
  lib.discord.guilds['@0.2.4'].retrieve({
    guild_id: `${context.params.event.guild_id}`,
    with_counts: false
  }),
  lib.discord.guilds['@0.2.4'].channels.list({
    guild_id: `${context.params.event.guild_id}`
  }),
])

const adminRole = guild.roles.find(role => role.name === 'admin')
if (!adminRole) {
  throw new Error('could not find admin role')
}

const memberRole = guild.roles.find(role => role.name === 'member')
if (!adminRole) {
  throw new Error('could not find member role')
}

const sudoRole = guild.roles.find(role => role.name === 'sudo')
if (!adminRole) {
  throw new Error('could not find sudo role')
}

const sudoChannel = channels.find(channel => channel.name === 'sudo')
if (!adminRole) {
  throw new Error('could not find sudo channel')
}

console.log(context.params.event.content)

const channelId = context.params.event.channel_id
const messageId = context.params.event.content.split(' ')[1]?.trim()
await createOrUpdateMessage(lib, channelId, messageId, {
  "embeds": [
    {
      "type": "rich",
      "title": `Toggle Admin Rights`,
      "description": [
        `<@&${adminRole.id}> use the 🛠️ emoji to turn your ADMINISTRATION rights on or off.`,
        `\n\n`,
        `**why this extra step?**`,
        `\n`,
        `With administration rights, you can *do and see everything* in the server, regardless of the configured permissions. For day-to-day use, that's not needed and it may create confusion and/or mistakes. For example, some channels are not intended to be written in; it's easy to misconfigure the visibility of a channel; or you might assume everyone can see your messages because you (as an administrator) can see all messages, everywhere.`,
        `\n\n`,
        `When you **turn off** your administration rights (i.e. you remove the <@&${sudoRole.id}> role from yourself), you can enjoy the server as a regular <@&${memberRole.id}>: you can join/leave localities as you please; show/hide the archive, and read-only channels will be enforced.`,
        `\n\n`,
        `When you **turn on** your administration rights (i.e. click the emoji to add the <@&${sudoRole.id}> role to yourself), you're able to *everything* in the server, including: adding or updating channels, adding or updating roles, (un)assigning roles to users, removing messages from someone else, banning users... Use these superpowers wisely.`,
        `\n\n`,
        `If you find yourself turning on admin rights a lot, consider asking <@${guild.owner_id}> to add some commonly used permissions directly to the <@&${adminRole.id}> role. The goal is to spend as little time in the <@&${sudoRole.id}> role as possible, but if you need superpowers, you can temporarily enable them in the <#${sudoChannel.id}> channel :superhero: `,
        `\n\n`,
        `**who can use this button?**`,
        `\n`,
        `Only people with the <@&${adminRole.id}> role can see this channel, and the bot will only give the <@&${sudoRole.id}> role to people with the <@&${adminRole.id}> role anyway. In other words, this feature cannot be abused by random people.`,
        `\n\n`,
        `**why is it called sudo?**`,
        `\n`,
        `It's a reference to the \`sudo\` command on Linux/Mac/UNIX systems :nerd: The command is most commonly used to gain elevated access to a computer system, for operations such as installing software, changing sensitive settings, accessing system folders... https://en.wikipedia.org/wiki/sudo`,
      ].join(''),
      "color": 0x295846,
    }
  ]
});
