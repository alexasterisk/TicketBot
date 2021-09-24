const { Constants, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')
const { creatorId } = require('../config.json')
const types = Constants.ApplicationCommandOptionTypes

const menus = {
    main_support: {
        embed: new MessageEmbed()
            .setColor('#e3a060')
            .setTitle('The Hedgebush Support')
            .setDescription('If you need help in-game, or to report other users, please use the buttons below to get in contact with an admin.\nThey will respond to you as quick as they can!')
            .setFooter('Created by Alexfurret#8525', 'https://cdn.discordapp.com/avatars/441211337750740993/5ea321b2eb591a88b65391a6943d00a1.png?size=256')
            .setTimestamp()
            .setThumbnail('https://cdn.discordapp.com/icons/481143570502254593/21339add87e03d40de0e7a71917f5e64.png?size=256'),
        rows: [
            new MessageActionRow()
                .addComponents(new MessageButton()
                    .setCustomId('support|general_support|maximum:3,fullName:General Support')
                    .setLabel('Support')
                    .setStyle('SECONDARY'))
                .addComponents(new MessageButton()
                    .setCustomId('support|suggestion|maximum:5,fullName:Suggestion')
                    .setLabel('Suggestion')
                    .setStyle('SECONDARY'))
                .addComponents(new MessageButton()
                    .setCustomId('support|user_report|maximum:3,fullName:User Report')
                    .setLabel('User Report')
                    .setStyle('SECONDARY'))
                .addComponents(new MessageButton()
                    .setCustomId('support|bug_report|maximum:5,fullName:Bug Report')
                    .setLabel('Bug Report')
                    .setStyle('SECONDARY'))
        ]
    }
}

module.exports = {
    name: 'sendout',
    description: 'Sends out pre-designed info-messages to a specific channel',

    permissionForAll: false,
    permissions: [{
        id: creatorId,
        type: 'USER',
        permission: true
    }],

    options: [{
        name: 'msg',
        description: 'The info-message to be sent',
        required: true,
        type: types.STRING,
        choices: [
            {name: 'Main Support Menu', value: 'main_support'}
        ]
    }, {
        name: 'channel',
        description: 'The channel for the info-message to be sent in',
        required: false,
        type: types.CHANNEL
    }],

    async execute (interaction) {
        const menu = interaction.options.getString('msg')
        const channel = interaction.options.getChannel('channel')

        if (channel.type !== 'GUILD_TEXT') return interaction.reply({
            ephemeral: true,
            embeds: [new MessageEmbed()
                .setDescription('Please provide a text channel!')
                .setColor('DARK_RED')
            ]
        })

        await channel.send({
            embeds: [menus[menu].embed],
            components: menus[menu].rows
        })

        interaction.reply({
            ephemeral: true,
            embeds: [new MessageEmbed()
                .setDescription(`Successfully sent info-box into ${channel}!`)
                .setColor('GREEN')
            ]
        })
    }
}