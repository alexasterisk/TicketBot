const { readdirSync } = require('fs')
const { guildId } = require('./config.json')

module.exports = {
    async deployAll (client) {
        const guild = client.guilds.cache.get(guildId)
        let commands = guild?.commands

        // Creating a table for setting the permissions for each command later
        let fullPermissions = []

        // Reading through each command file to state if it needs created or edited, most importantly updating the permissions necessary
        // The reason the commands aren't just recreated each time is to not spam the Discord API, I don't wany my bot taken down afterall

        const commandFiles = readdirSync('./commands').filter(file => file.endsWith('.js'))
        for (const file of commandFiles) {
            const command = require(`./commands/${file}`)

            // Creating a command
            // This will trigger only if the command specifically says it needs "pushed" AND the command doesn't already exist

            if (command.isCommand ?? true) {
                const cmd = await commands?.create({
                    name: command.name,
                    description: command.description,
                    options: command.options ?? [],
                    defaultPermission: command.permissionForAll ?? true
                })
    
                console.log(`Created ${command.name}!`)
    
                // Updating all of the permissions for each command
                // Do not forget defaultPermission when creating/editing a command
    
                fullPermissions.push({
                    id: cmd.id,
                    permissions: command.permissions ?? []
                })
            }
        }

        await commands?.permissions.set({ fullPermissions })
        console.log(`Updated all permissions!`)
    }
}