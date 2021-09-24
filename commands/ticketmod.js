// refer to support.js
const { Constants, MessageEmbed, Permissions } = require('discord.js')
const { adminRoleId } = require('../config.json')
const types = Constants.ApplicationCommandOptionTypes

module.exports = {
    name: 'ticketmod',
    description: 'The moderators way of controlling tickets',

    permissionForAll: false,
    permissions: [{
        id: adminRoleId,
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
        undoadd: {
            async execute (interaction, data) {
                if (interaction.user.id === data.originalUser || interaction.member.roles.cache.get(adminRoleId)) {
                    if (interaction.channel.permissionsFor(data.userRemoving).has(Permissions.FLAGS.VIEW_CHANNEL)) {
                        await interaction.channel.permissionOverwrites.edit(data.userRemoving, {
                            VIEW_CHANNEL: false,
                            SEND_MESSAGES: false
                        }, { type: 1 })

                        interaction.reply({
                            embeds: [new MessageEmbed()
                                .setDescription(`${interaction.guild.members.cache.get(data.userRemoving)} has been removed from this ticket by ${interaction.user}`)
                                .setColor('ORANGE')
                                .setTitle('Member Removed from Ticket')
                                .setTimestamp()
                            ]
                        })
                    } else {
                        interaction.reply({
                            ephemeral: true,
                            embeds: [new MessageEmbed()
                                .setDescription('This user is not in this ticket!')
                                .setColor('DARK_RED')]
                        })
                    }
                } else {
                    interaction.reply({
                        ephemeral: true,
                        embeds: [new MessageEmbed()
                            .setDescription('You do not have permission to undo this action.')
                            .setColor('DARK_RED')
                        ]
                    })
                }
            }
        }
    },

    // make ticketmod work lol
    async execute (interaction) {
        await interaction.reply('hi')
    }
}