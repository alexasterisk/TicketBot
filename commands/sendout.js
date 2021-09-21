const { Constants, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js')
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
                    .setCustomId('support|general_support')
                    .setLabel('Support')
                    .setStyle('SECONDARY'))
                .addComponents(new MessageButton()
                    .setCustomId('support|suggestion')
                    .setLabel('Suggestion')
                    .setStyle('SECONDARY'))
                .addComponents(new MessageButton()
                    .setCustomId('support|user_report')
                    .setLabel('User Report')
                    .setStyle('SECONDARY'))
                .addComponents(new MessageButton()
                    .setCustomId('support|bug_report')
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
        id: '889717622051065876',
        type: 'ROLE',
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
            contents: 'Please provide a text channel!',
            ephemeral: true
        })

        await channel.send({
            embeds: [menus[menu].embed],
            components: menus[menu].rows
        })

        interaction.reply({
            content: `Successfully sent info-box into ${channel}!`,
            ephemeral: true
        })
    }
}