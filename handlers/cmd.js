const fs = require('fs')

/**
 * @param {Client} client
*/
module.exports.init = async (client) => {
    console.log("[HANDLER] Cmd handler started!")
    
    for(let dir of fs.readdirSync('./commands')) {
        for(let file of fs.readdirSync(`./commands/${dir}`).filter(x=>x.endsWith(".js"))) {
            const cmd = require(`../commands/${dir}/${file}`)
            client.commandsArray.push(cmd.slash.toJSON())
            client.commands.set(cmd.slash.toJSON().name, cmd)
        }
    }

    client.application.commands.set(client.commandsArray)
}
