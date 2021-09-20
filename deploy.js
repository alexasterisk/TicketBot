const { guildId } = require('./config.json');
const { readdirSync } = require('fs');

module.exports = {
    async run (client) {
        const guild = client.guilds.cache.get(guildId);
        let commands = guild?.commands || client.application?.commands;

        const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`./commands/${file}`);

            if (!command.isPushed) {
                commands?.create({
                    name: command.name,
                    description: command.description,
                    options: command.options
                });
            } else if (command.needsUpdated) {
                const cmd = client.application?.commands.cache.get(c => c.name === command.name);

                if (cmd) {
                    cmd.edit({
                        name: command.name,
                        description: command.description,
                        options: command.options
                    });
                };
            };
        };
    }
};