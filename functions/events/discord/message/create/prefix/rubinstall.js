const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

try {
  // NOTE: attempting to create a command that already exists, will update that command instead
  //       see: https://discord.com/developers/docs/interactions/application-commands#updating-and-deleting-a-command
  
  // SLASH COMMAND: list-people
  await lib.discord.commands['@0.0.0'].create({
    "guild_id": "991741295758430228",
    "name": "list-people",
    "description": "list all people that can read the given channel",
    "options": [
      {
        "type": 7,
        "name": "channel",
        "description": "the channel for which people should be listed",
        "required": true
      }
    ]
  });

  // SLASH COMMAND: test-channels
  await lib.discord.commands['@0.0.0'].create({
    "guild_id": "991741295758430228",
    "name": "test-channels",
    "description": "run some checks to see if the channels are configured as expected",
    "options": []
  });

  // SLASH COMMAND: set-bot-status
  await lib.discord.commands['@0.0.0'].create({
    "guild_id": "991741295758430228",
    "name": "set-bot-status",
    "description": "set the status of Regens Unite Bot",
    "options": [
      {
        "type": 3,
        "name": "type",
        "description": "the status type",
        "choices": [
          {
            "name": "playing",
            "value": "GAME"
          },
          {
            "name": "listening to",
            "value": "LISTENING"
          },
          {
            "name": "watching",
            "value": "WATCHING"
          },
          {
            "name": "competing in",
            "value": "COMPETING"
          }
        ],
        "required": true
      },
      {
        "type": 3,
        "name": "status",
        "description": "the new bot status",
        "required": true
      }
    ]
  });

  // SLASH COMMAND: clear-bot-status
  await lib.discord.commands['@0.0.0'].create({
    "guild_id": "991741295758430228",
    "name": "clear-bot-status",
    "description": "clear the status of Regens Unite Bot",
    "options": []
  });

  // SUCCESS MESSAGE
  await lib.discord.channels['@0.3.2'].messages.create({
    channel_id: `${context.params.event.channel_id}`,
    content: `✅ Regens Unite Bot was successfully installed.`,
  });  
} catch (e) {
  // FAILURE MESSAGE
  console.log(e);
  await lib.discord.channels['@0.3.2'].messages.create({
    channel_id: `${context.params.event.channel_id}`,
    content: `❌ Failed to install Regens Unite Bot in this server. Error: \`\`\`${e}\`\`\``,
  });
}
