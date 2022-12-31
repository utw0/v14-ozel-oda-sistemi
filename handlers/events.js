const { Client } = require("discord.js");
const fs = require('fs')

/**
 * @param {Client} client
*/
module.exports.init = async (client) => {
    console.log(`[HANDLER] Event handler started!`)
    fs.readdirSync('./events').forEach(dir => {
        fs.readdirSync(`./events/${dir}`).filter(s => s.endsWith('.js')).forEach(file => {
            const evt = require(`../events/${dir}/${file}`)
            console.log(`[EVENTS] ${evt.name}!!!!`)
            client.on(evt.name, evt.execute.bind(null, client))
        })
    })
}