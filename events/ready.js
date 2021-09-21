module.exports = {
    name: 'ready',
    once: true,

    execute (client) {
        client.user.setStatus('dnd');
        console.log(`Logged in as ${client.user.tag}!`)
        require('../deploy').deployAll(client)
    }
}