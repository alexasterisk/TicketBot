const { Constants, MessageEmbed, MessageActionRow, MessageButton, Permissions } = require('discord.js')
const { adminRoleId } = require('../config.json')
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
    }],

    buttons: {
        close: {
            async execute (interaction, data) {
                if ((interaction.user.id !== data.belongsTo) && !interaction.member.roles.cache.get(r => r.name === adminRoleId)) {
                    return interaction.reply({
                        ephemeral: true,
                        embeds: [new MessageEmbed()
                            .setDescription('You do not have permission to close this ticket!')
                            .setColor('DARK_RED')
                        ]
                    })
                }

                const channel = await interaction.guild?.channels.cache.get(data.channelId)

                await interaction.reply({
                    embeds: [new MessageEmbed()
                        .setDescription(`${interaction.user} has closed this ticket!`)
                        .setTitle('🔒 Ticket Closed')
                        .setTimestamp()
                        .setColor('YELLOW')
                    ]
                })

                await new Promise (r => setTimeout(r, 5000))

                await channel.delete().catch(e => {
                    interaction.reply({
                        ephemeral: true,
                        embeds: [new MessageEmbed()
                            .setDescription('Sorry! An error occured while running that interface!\nPlease try again and if the error persists please contact a staff member!')
                            .setColor('RED')
                        ]
                    })
                    return console.error(e)
                })

                const numberOfThreads = await interaction.client.database.get(`opened|${data.type}|${data.belongsTo}`) ?? 1
                interaction.client.database.set(`opened|${data.type}|${data.belongsTo}`, (numberOfThreads - 1) ?? 0)
            }
        }
    },

    subs: {
        add: {
            async execute (interaction) {
                const user = interaction.options.getMember('user')
                const reason = interaction.options.getString('reason') ?? 'No reason specified.'

                if (!user) {
                    return interaction.reply({
                        ephemeral: true,
                        embeds: [new MessageEmbed()
                            .setDescription('The member you tried adding either does not exist or isn\'t in the server!\nPlease try again.')
                            .setColor('DARK_RED')
                        ]
                    })
                }

                if (user.permissionsIn(interaction.channel).has(Permissions.FLAGS.VIEW_CHANNEL)) {
                    return interaction.reply({
                        ephemeral: true,
                        embeds: [new MessageEmbed()
                            .setDescription(`${user} is already in this ticket!\nIf you meant to add someone else, try again.`)
                            .setColor('DARK_ORANGE')
                        ]
                    })
                }

                interaction.channel.permissionOverwrites.edit(user, {
                    VIEW_CHANNEL: true,
                    SEND_MESSAGES: true
                }, {
                    reason: reason,
                    type: 1
                })
                    .then(async _ => {
                        await interaction.reply({
                            embeds: [new MessageEmbed()
                                .setTitle('Member Added to Ticket')
                                .setDescription(`${interaction.user} has added ${user} to the ticket!\n\n**Reason:** *${reason}*`)
                                .setColor('GOLD')
                                .setTimestamp()
                            ],
                            components: [new MessageActionRow()
                                .addComponents(new MessageButton()
                                    .setCustomId(`ticketmod|undoadd|originalUser:${interaction.user.id},userRemoving:${user.id}`)
                                    .setLabel('Undo')
                                    .setStyle('DANGER')
                                )
                            ]
                        })

                        const filter = i => i.customId === `ticketmod|undoadd|originalUser:${interaction.user.id},userRemoving:${user.id}` && null // put user locks here
                        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 })

                        collector.on('collect', async i => {
                            if (i.customId === `ticketmod|undoadd|originalUser:${interaction.user.id},userRemoving:${user.id}`) {
                                if (i.user.id != interaction.user.id || !i.member.roles.cache.get(adminRoleId)) return interaction.followUp({
                                    ephemeral: true,
                                    embeds: [new MessageEmbed()
                                        .setDescription('You do not have permission to undo this interaction!')
                                        .setColor('DARK_RED')
                                    ]
                                })

                                await i.update({
                                    components: [new MessageActionRow()
                                        .addComponents(new MessageButton()
                                            .setCustomId('null|null')
                                            .setLabel('Undo')
                                            .setStyle('DANGER')
                                            .setDisabled(true)
                                        )
                                    ]
                                })

                                collector.stop('Received necessary interaction')
                            }
                        })
                    })
            }
        }
    }
}