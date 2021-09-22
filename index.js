// requirements
require('dotenv').config()

const Keyv = require('keyv')
const { Client, Collection, Intents } = require('discord.js')
const { readdirSync } = require('fs')
const { guildId } = require('./config.json')


// initialize
const keyv = new Keyv('sqlite://data.sqlite')
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS
    ]
})

client.database = keyv

// handle all events
keyv.on('error', err => console.error('Keyv connection error:', error))

const eventFiles = readdirSync('./events').filter(file => file.endsWith('.js'))
for (const file of eventFiles) {
    const event = require(`./events/${file}`)
    
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args))
    } else {
        client.on(event.name, (...args) => event.execute(...args))
    }
}

// when an interaction is created (aka command has been ran)
client.commands = new Collection()

const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'))
for (const file of commandFiles) {
    const command = require(`./commands/${file}`)
    client.commands.set(command.name, command)
}

client.on('interactionCreate', async (interaction) => {
    if (!interaction.inGuild() && interaction.guildId == guildId) return

    // This is for commands
    if (interaction.isCommand()) {
        const command = client.commands.get(interaction.commandName)
        if (!command) return

        if (!command.permissionForAll) {
            if (command.permissions) {
                let isListed = false

                for (const permTable of command.permissions) {
                    if ((
                        (permTable.type === 'USER' && permTable.id === interaction.user.id) ||
                        (permTable.type === 'ROLE' && (interaction.member.roles).cache.has(permTable.id))
                        ) && permTable.permission) {
                            isListed = true
                            break
                    }
                }

                if (!isListed) return interaction.reply({
                    content: 'You do not have permission to run this command.\nIf you believe this is a mistake please contact a staff member.',
                    ephemeral: true
                })
            }
        }

        try {
            await command.execute(interaction)
        } catch (error) {
            interaction.reply({
                content: 'There was an error while executing this command!',
                ephemeral: true
            })
            console.error(error)
        }

    // This is for buttons
    } else if (interaction.isButton()) {

        // Split the data into useable data, remember the format
        // fileName|buttonName|userRunning:userId,name:value ...
        
        const data = interaction.customId.split('|')
        const fileName = data[0]

        const file = client.commands.get(fileName)
        if (!file) return

        const buttonName = data[1]
        
        // Split the extraData (name:value,name:value) into useable plain JSON table
        // {Name: 'value', name: 'value'}

        let dataTable = {}
        const extraData = data[2].split(',')

        for (const dataPair of extraData) {
            const spl = dataPair.split(':')
            dataTable[spl[0]] = spl[1]
        }

        // Attempt running the interaction if the person should be able to run it
        if (!dataTable['userRunning'] || (dataTable['userRunning'] === interaction.user.id)) {
            try {
                await file.buttons[buttonName]?.execute(interaction, dataTable['userRunning'], dataTable)
            } catch (error) {
                interaction.reply({
                    content: 'There was an error while running this button!',
                    ephemeral: true
                })
            }
        } else {
            interaction.reply({
                content: 'You do not have permission to use this button!',
                ephemeral: true
            })
        }

    // This is for Select Menus
    } else if (interaction.isSelectMenu()) {
    }
})

// login
client.login(process.env.TOKEN)