// refer to support.js
const { Constants, MessageEmbed, Permissions, MessageActionRow, MessageButton } = require('discord.js')
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
                    if (interaction.channel.permissionsFor(data.userRemoving)?.has(Permissions.FLAGS.VIEW_CHANNEL)) {

                        if (interaction.guild.members.fetch(data.userRemoving)?.roles.cache.has(adminRoleId)) {
                            return interaction.reply({
                                ephemeral: true,
                                embeds: [new MessageEmbed()
                                    .setDescription('You cannot remove an admin from tickets!')
                                    .setColor('DARK_ORANGE')
                                ]
                            })
                        }

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
        },

        unlock: {
            async execute (interaction, data) {
                if (!interaction.channel.permissionsFor(data.ticketOwner)?.has(Permissions.FLAGS.SEND_MESSAGES)) {
                    return interaction.followUp({
                        embeds: [new MessageEmbed()
                            .setDescription('This channel is not locked!')
                            .setColor('DARK_RED')
                        ],
                        ephemeral: true
                    })
                }

                // ticketOwner, type, lockedBy
                interaction.channel.edit({
                    permissionOverwrites: [{
                        id: interaction.guild.roles.everyone,
                        deny: Permissions.FLAGS.VIEW_CHANNEL
                    }, {
                        id: interaction.guild.roles.cache.get(adminRoleId),
                        allow: [ Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES ]
                    }, {
                        id: data.ticketOwner,
                        allow: [ Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES ]
                    }, {
                        id: interaction.guild.me,
                        allow: [ Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES ]
                    }]
                })
                    .then(_ => {
                        interaction.followUp({
                            embeds: [new MessageEmbed()
                                .setTitle('🔓 Ticket Unlocked')
                                .setDescription(`${interaction.user} has unlocked this ticket!`)
                                .setTimestamp()
                                .setColor('DARK_GOLD')
                            ]
                        })
                    })
                    .catch(error => {
                        interaction.followUp({
                            embeds: [new MessageEmbed()
                                .setDescription('There was an error unlocking this ticket! Please try again.')
                                .setColor('RED')
                            ]
                        })
                        return console.error(error)
                    })
            }
        }
    },


    // i really doubt that this works

    subs: {
        close: {
            async execute (interaction) {
                const isTicket = interaction.channel.name.match(/\d+$/)
                const reason = interaction.options.getString('reason') ?? 'No reason specified'
                const ticketData = interaction.channel.topic?.split(';')

                if (isTicket && ticketData) {
                    const originalTicketCreator = ticketData[1].split(':')?.[1]
                    const ticketType = ticketData[0].split(':')?.[1]

                    await interaction.reply({
                        embeds: [new MessageEmbed()
                            .setDescription(`${interaction.user} has closed this ticket!\n\n**Reason:** *${reason}*`)
                            .setTitle('🔒 Ticket Closed')
                            .setTimestamp()
                            .setColor('YELLOW')
                        ]
                    })

                    await new Promise (r => setTimeout(r, 5000))

                    await interaction.channel.delete(reason).catch(e => {
                        interaction.reply({
                            ephemeral: true,
                            embeds: [new MessageEmbed()
                                .setDescription('Sorry! An error occured while running that command!\nPlease try again and if the error persists please contact a staff member!')
                                .setColor('RED')
                            ]
                        })
                        return console.error(e)
                    })

                    const numberOfThreads = await interaction.client.database.get(`opened|${ticketType}|${originalTicketCreator}`) ?? 1
                    interaction.client.database.set(`opened|${ticketType}|${originalTicketCreator}`, (numberOfThreads - 1) ?? 0)
                } else {
                    interaction.reply({
                        ephemeral: true,
                        embeds: [new MessageEmbed()
                            .setDescription('You do not have permission to delete this ticket!\nThis could be due to that you\'re not in a ticket channel.')
                            .setColor('DARK_RED')
                        ]
                    })
                }
            }
        },

        lock: { // make lock ability appear immediately and disappear immediately
            async execute (interaction) {
                const isTicket = interaction.channel.name.match(/\d+$/)
                const reason = interaction.options.getString('reason') ?? 'No reason specified'
                const ticketData = interaction.channel.topic?.split(';')

                if (isTicket && ticketData) {
                    const originalTicketCreator = ticketData[1].split(':')?.[1]
                    const ticketType = ticketData[0].split(':')?.[1]

                    await interaction.reply({
                        embeds: [new MessageEmbed()
                            .setDescription(`${interaction.user} has locked this ticket!`)
                            .setTitle('🔒 Ticket Locked')
                            .setTimestamp()
                            .setColor('YELLOW')
                        ]
                    })

                    await interaction.channel.permissionOverwrites.cache.map(async (permission) => {
                        if (permission.id != adminRoleId && permission.type === 'member' && permission.id != '173174199110729728' && permission.id != '889718572484546590') {
                            await permission.delete(reason)
                        }
                    })

                    const numberOfThreads = await interaction.client.database.get(`opened|${ticketType}|${originalTicketCreator}`) ?? 1
                    interaction.client.database.set(`opened|${ticketType}|${originalTicketCreator}`, (numberOfThreads - 1) ?? 0)

                    await interaction.editReply({
                        components: [new MessageActionRow()
                            .addComponents(new MessageButton()
                                .setCustomId(`ticketmod|unlock|ticketOwner:${originalTicketCreator},type:${ticketType},lockedBy:${interaction.user.id}`)
                                .setLabel('Unlock')
                                .setStyle('SECONDARY')
                                .setEmoji('🔓')
                            )
                        ]
                    })

                    const filter = i => i.customId === `ticketmod|unlock|ticketOwner:${originalTicketCreator},type:${ticketType},lockedBy:${interaction.user.id}`
                    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 })

                    collector.on('collect', async i => {
                        if (i.customId === `ticketmod|unlock|ticketOwner:${originalTicketCreator},type:${ticketType},lockedBy:${interaction.user.id}`) {
                            await i.update({
                                components: [new MessageActionRow()
                                    .addComponents(new MessageButton()
                                        .setCustomId(`null|null}`)
                                        .setLabel('Unlock')
                                        .setStyle('SECONDARY')
                                        .setEmoji('🔓')
                                        .setDisabled(true)
                                    )
                                ]
                            })
                            collector.stop('Received necessary interaction')
                        }
                    })
                } else {
                    interaction.reply({
                        ephemeral: true,
                        embeds: [new MessageEmbed()
                            .setDescription('You do not have permission to delete this ticket!\nThis could be due to that you\'re not in a ticket channel.')
                            .setColor('DARK_RED')
                        ]
                    })
                }
            }
        }
    }
}