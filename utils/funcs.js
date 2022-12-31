module.exports.checkDB = async (id, guild) => {
    !(await UserModel.findOne({ userId: id, guildId: guild })) ? UserModel.create({ userId: id, guildId: guild }) : null
}
