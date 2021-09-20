// const { Constants } = require('discord.js');

module.exports = {
    isPushed: false,
    needsUpdated: false,

    name: 'ping',
    description: 'Replies with Pong.',
    /* options: [{
        name: 'num1',
        description: 'The first number',
        required: true,
        type: Constants.ApplicationCommandOptionTypes.NUMBER
    }, {
        name: 'num2',
        description: 'The second number',
        required: true,
        type: Constants.ApplicationCommandOptionTypes.NUMBER
    }] */

    async execute (interaction) {
        await interaction.reply({
            content: 'Pong!',
            ephemeral: true
        });
    }
};