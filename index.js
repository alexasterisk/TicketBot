// requirements
require('dotenv').config();

const { Client, Collection, Intents } = require('discord.js');
const { readdirSync } = require('fs');

// initialize
const client = new Client({intents: [Intents.FLAGS.GUILDS]});

// handle all events
const eventFiles = readdirSync('./events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    };
};

// when an interaction is created (aka command has been ran)
client.commands = new Collection();

const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.data.name, command);
};

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        await interaction.reply({content: 'There was an error while executing this command!', ephemeral: true});
    };
});

// login
client.login(token);