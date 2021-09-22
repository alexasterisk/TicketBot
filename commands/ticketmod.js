// refer to support.js
const { Constants } = require('discord.js')
const { modRoleId } = require('../config.json')
const types = Constants.ApplicationCommandOptionTypes

module.exports = {
    name: 'ticketmod',
    description: 'The moderators way of controlling tickets',

    permissionForAll: false,
    permissions: [{
        id: modRoleId,
        type: 'ROLE',
        permission: true
    }],

    options: [{
        name: 'close',
        description: 'Closes a ticket immediately',
        type: types.SUB_COMMAND,
        options: [{
            name: 'reason',
            description: 'Why are you closing the ticket?',
            required: false,
            type: types.STRING
        }],
    }, {
        name: 'lock',
        description: 'Locks a ticket immediately',
        type: types.SUB_COMMAND,
        options: [{
            name: 'reason',
            description: 'Why are you locking this ticket?',
            required: false,
            type: types.STRING
        }]
    }],

    buttons: {
        close: {
            async execute (interaction, _, data) {
                
            }
        }
    },

    async execute (interaction) {
        await interaction.reply('hi')
    }
}