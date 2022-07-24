const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

module.exports = {
  onlyOwner: async (context) => {
    const { guild_id, author } = context.params.event
    
    const guild = await lib.discord.guilds['@0.2.4'].retrieve({
      guild_id,
      with_counts: false
    })    

    if (guild.owner_id !== author.id) {
      throw new Error(`User ${author.username}#${author.discriminator} is not the server owner.`)
    }
  }
}

