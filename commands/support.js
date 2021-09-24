const { Constants, MessageEmbed, MessageActionRow, MessageButton, Permissions } = require('discord.js')
const { adminRoleId, supportCategoryId } = require('../config.json')
const types = Constants.ApplicationCommandOptionTypes

const footerPool = ['ur cool', 'hello', 'hm', 'hmmm', 'who reads these', 'r u cool', 'probably made by alex', 'why did i make this', 'aeaeae', '\'ello', 'hallo', 'hola']

const embedInput = {
    general_support: 'What exactly are you looking for help with? We will assist you as best as we can.',
    suggestion: 'What exactly are you suggesting? Please provide the following details:\n\n> **What game is it for? Or is it for Discord?**\n> **What is it?**\n> **How would it be beneficial?**\n> and any images for reference (if applicable)',
    user_report: 'When filling out a report, be sure to provide the following information:\n\n> **Who are you reporting?**\n> **Are they in-game, if so which game?**\n> **What exactly are they doing?**\n> **Do you have proof of this happening?**\n> If you do have proof, be sure to provide it to better help us!',
    bug_report: 'What exactly are you reporting as a bug? Please provide the following details:\n\n> **Which game did you find this bug in?**\n> **What exactly is happening?**\n> **Steps to reproduce the bug**\n> Images of the bug happening (if applicable)'
}

async function createThread (type, interaction, data) {
    const amountOfThreadsInType = await interaction.client.database.get(`opened|${type}|all`) ?? 0
    const amountOfThreads = await interaction.client.database.get(`opened|${type}|${interaction.user.id}`) ?? 0
    interaction.client.database.set(`opened|${type}|all`, (amountOfThreadsInType + 1) ?? 1)
    interaction.client.database.set(`opened|${type}|${interaction.user.id}`, (amountOfThreads + 1) ?? 1)

    if (amountOfThreads >= data.maximum) return interaction.reply({
        ephemeral: true,
        embeds: [new MessageEmbed()
            .setDescription('Sorry! You\'ve reached the maximum amount of support tickets for this category.')
            .setColor('DARK_RED')
        ]
    })

    interaction.guild.channels.create(`${type}-${amountOfThreadsInType}`, {
        type: 'GUILD_TEXT',
        topic: `Ticket ${amountOfThreadsInType} - ${data.fullName}`,
        reason: `${interaction.user.tag} opened a ${data.fullName} ticket`,
        parent: supportCategoryId,
        permissionOverwrites: [{
            id: interaction.guild.roles.everyone,
            deny: Permissions.FLAGS.VIEW_CHANNEL
        }, {
            id: interaction.guild.roles.cache.get(adminRoleId),
            allow: [ Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES ]
        }, {
            id: interaction.member,
            allow: [ Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES ]
        }, {
            id: interaction.guild.me,
            allow: [ Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES ]
        }]
    })
        .then(async channel => {
            await channel.send({
                embeds: [new MessageEmbed()
                    .setAuthor(`${interaction.user.tag}'s Ticket`, interaction.user.avatarURL({ format: 'png' }))
                    .setTitle(`${data.fullName} Formatting`)
                    .setDescription(`${embedInput[type]}\n\nIf you did not mean to open this ticket, please click "Close" below.`)
                    .setColor('DARK_GOLD')
                ],
                components: [new MessageActionRow()
                    .addComponents(new MessageButton()
                        .setCustomId(`ticket|close|channelId:${channel.id},belongsTo:${interaction.user.id},type:${type}`)
                        .setLabel('Close')
                        .setStyle('DANGER')
                        .setEmoji('🔒')
                    )
                ]
            })

            await interaction.reply({
                embeds: [new MessageEmbed()
                    .setFooter(footerPool[Math.floor(Math.random() * footerPool.length)], 'https://cdn.discordapp.com/avatars/441211337750740993/5ea321b2eb591a88b65391a6943d00a1.png?size=256')
                    .setTimestamp()
                    .setDescription(`You can visit your channel at ${channel}\nSupport will get to you shortly!`)
                    .setColor('BLURPLE')
                ],
                ephemeral: true
            })
        })
        .catch(error => {
            console.log(error)
            interaction.reply({
                ephemeral: true,
                embeds: [new MessageEmbed()
                    .setDescription('There was an error while opening your ticket, please try again or contact a staff member for help!')
                    .setColor('RED')
                ]
            })
        })
}

module.exports = {
    name: 'support',
    description: 'Create a support ticket to get help from staff members',

    options: [{
        name: 'for',
        description: 'What do you need support for?',
        required: true,
        type: types.STRING,
        choices: [
            {name: 'General Support', value: 'general_support'},
            {name: 'Suggestion', value: 'suggestion'},
            {name: 'User Report', value: 'user_report'},
            {name: 'Bug Report', value: 'bug_report'}
        ]
    }, {
        name: 'details',
        description: 'Can you provide any more details?',
        required: false,
        type: types.STRING
    }],

    buttons: {
        general_support: { async execute (interaction, data) { await createThread('general_support', interaction, data) } },
        user_report: { async execute (interaction, data) { await createThread('user_report', interaction, data) } },
        bug_report: { async execute (interaction, data) { await createThread('bug_report', interaction, data) } },
        suggestion: { async execute (interaction, data) { await createThread('suggestion', interaction, data) } },
    },

    async execute (interaction) {
        // make slash interactive menu fucking loser
        // or die

        // wait
        // this is me
        // me die
    }
}