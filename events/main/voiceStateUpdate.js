const { Client, EmbedBuilder, PermissionFlagsBits, ChannelType } = require('discord.js')
const { checkDB } = require('../../utils/funcs');

const Guild = require('../../models/Guild')
const User = require('../../models/User')
module.exports = {
    name: 'voiceStateUpdate',
    /**
     * @param {Interaction} interaction
     * @param {Client} client
     */
    async execute(client, oldState, newState) {
        let data = await Guild.findOne({ guildId: newState.guild.id });
        let user = await User.findOne({ userId: newState.member.user.id });
        if (!user) {
            await User.create({ userId: newState.member.user.id })
        }
        let channelId = await data?.private_voices?.channelId;
        let categoryId = await data?.private_voices?.categoryId;
        if (oldState.channel?.id !== data?.private_voices?.channelId && oldState.channel?.parent?.id == data?.private_voices?.categoryId && oldState.channel?.members.size === 0) {
            oldState.channel.delete()
            await User.updateOne({ userId: newState.member.user.id }, {
                $set: {
                    'private_voices.voiceId': null,
                    'private_voices.lock': true
                }
            })
        }
        if (data?.private_voices?.mode === true) {
            if (newState.channel?.id == channelId) {
                newState.guild.channels.create({
                    name: `${newState.member.user.username}'s channel`,
                    type: ChannelType.GuildVoice,
                    parent: categoryId,
                    permissionOverwrites: [{
                        id: newState.member.id,
                        allow: [PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MuteMembers, PermissionFlagsBits.DeafenMembers]
                    }, {
                        id: newState.guild.id,
                        deny: [PermissionFlagsBits.ManageChannels]
                    }]
                }).then(async (channel) => {
                    await User.updateOne({ userId: newState.member.user.id }, {
                        $set: {
                            'private_voices.voiceId': channel.id,
                        }
                    })
                    newState.setChannel(channel)
                })
            }
        }
    }
}