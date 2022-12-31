const { Client, Collection } = require("discord.js")
const client = new Client({
    intents: 131071 
})
client.setMaxListeners(0)

client.commands = new Collection()
client.commandsArray = []

global.Config = require('./jsons/config.json')
global.GuildModel = require('./models/Guild')
global.UserModel = require('./models/User')

require('./utils/db').init()
require('./handlers/events.js').init(client)

client.login(Config.token) 

client.on('error', error => console.log(error))
client.on('warn', warn => console.log(warn))
process.on('uncaughtException', console.error);
process.on('unhandledRejection', console.error);

module.exports = client;
