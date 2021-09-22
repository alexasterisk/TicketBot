const { Constants } = require('discord.js')
const { modRoleId } = require('../config.json')
const types = Constants.ApplicationCommandOptionTypes

module.exports = {
    name: 'ticket',
    description: 'A way of controlling your tickets',

    options: [{
        name: 'add',
        description: 'Adds a user to the ticket',
        type: types.SUB_COMMAND,
        options: [{
            name: 'user',
            description: 'The person who you would like to add',
            required: true,
            type: types.USER
        }, {
            name: 'reason',
            description: 'Why are you adding them to the ticket?',
            required: false,
            type: types.STRING
        }]
    }, {
        name: 'open',
        description: 'Creates a new ticket',
        type: types.SUB_COMMAND,
        options: [{
            name: 'type',
            description: "The type of ticket you'd like to open",
            required: true,
            type: types.STRING,
            choices: [
                {name: 'General Support', value: 'general_support'},
                {name: 'Suggestion', value: 'suggestion'},
                {name: 'User Report', value: 'user_report'},
                {name: 'Bug Report', value: 'bug_report'}
            ]
        }]
    }],

    buttons: {
        close: {
            async execute (interaction, _, data) {
                if ((interaction.user.id !== data.belongsTo) && !interaction.member.roles.cache.get(r => r.name === modRoleId)) {
                    return interaction.reply({
                        content: 'You do not have permission to close this ticket!',
                        ephemeral: true
                    })
                }

                const numberOfThreads = await interaction.client.database.get(`opened|${data.type}|${data.belongsTo}`) ?? 1
                const channel = await interaction.guild?.channels.cache.get(data.channelId)

                await interaction.deferReply()
                await interaction.editReply(`${interaction.user} has closed this ticket.`)
                await new Promise (r => setTimeout(r, 5000))

                await channel.delete().catch(e => {
                    interaction.reply({
                        content: 'An error occured while running that interface, please try again!\nIf this error persists, please contact a staff member.',
                        ephemeral: true
                    })
                    return console.error(e)
                })

                interaction.client.database.set(`opened|${data.type}|${data.belongsTo}`, (numberOfThreads - 1) ?? 0)
            }
        }
    },

    async execute (interaction) {

    }
}