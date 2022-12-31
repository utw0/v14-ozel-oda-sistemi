const { Interaction, Client, EmbedBuilder, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle } = require('discord.js')
const Perms = require('../../jsons/permissions.json');
const { checkDB } = require('../../utils/funcs');

const Guild = require('../../models/Guild')
const User = require('../../models/User');
module.exports = {
    name: 'interactionCreate',
    /**
     * @param {Interaction} interaction
     * @param {Client} client
     */
    async execute(client, interaction) {
        if (interaction.isButton()) {
            if (interaction.customId === 'detete') return;
            let data = await Guild.findOne({ guildId: interaction.guild.id });
            let user_olddata = await User.findOne({ userId: interaction.user.id });
            if (!user_olddata) { await User.create({ userId: interaction.user.id }) }
            let user_data = await User.findOne({ userId: interaction.user.id });
            if (data?.private_voices?.mode === true) {
                if (interaction.member?.voice.channel && interaction.channel.id === data?.private_voices?.textId && interaction.channel.id === data.private_voices.textId && interaction.member?.voice.channel.id === user_data?.private_voices?.voiceId && interaction.member.voice.channel.id === user_data.private_voices.voiceId) {
                    if (interaction.customId === 'rename') {
                        const Modal = new ModalBuilder()
                            .setCustomId('myModal')
                            .setTitle('Kanal adı değişikliği');
                        const Input = new TextInputBuilder()
                            .setCustomId('Input')
                            .setPlaceholder('Müzik dinliyoruz')
                            .setLabel("Yeni bir ad girin")
                            .setStyle(TextInputStyle.Short)
                            .setMinLength(1)
                            .setMaxLength(24)
                        firstActionRow = new ActionRowBuilder().addComponents(Input);
                        Modal.addComponents(firstActionRow);
                        await interaction.showModal(Modal);
                    }
                    if (interaction.customId === 'lock') {
                        let user_data = await User.findOne({ userId: interaction.user.id });
                        if (user_data?.private_voices?.lock === false) {
                            let textId = await client.channels.fetch(data?.private_voices?.textId)
                            await User.updateOne({ userId: interaction.user.id }, {
                                $set: {
                                    'private_voices.lock': true
                                }
                            })
                            await interaction.reply({ embeds: [new EmbedBuilder().setColor('BLURPLE').setDescription(`🔓 Kanal açık`)], ephemeral: true }).catch(() => null)
                            await interaction.member.voice.channel.edit({
                                parent: data?.private_voices?.categoryId,
                                permissionOverwrites: [
                                    {
                                        id: interaction.guild.roles.everyone,
                                        allow: ['CONNECT']
                                    }
                                ]
                            }).catch(() => null)
                        } else if (user_data?.private_voices?.lock === true) {
                            await User.updateOne({ userId: interaction.user.id }, {
                                $set: {
                                    'private_voices.lock': false
                                }
                            })
                            await interaction.reply({ embeds: [new EmbedBuilder().setColor('BLURPLE').setDescription(`🔒 Kanal kapalı`)], ephemeral: true }).catch(() => null)
                            await interaction.member.voice.channel.edit({
                                parent: data?.private_voices?.categoryId,
                                permissionOverwrites: [
                                    {
                                        id: interaction.guild.roles.everyone,
                                        deny: ['CONNECT']
                                    }
                                ]
                            }).catch(() => null)
                        }
                    }
                    if (interaction.customId === 'bit') {
                        const Modal = new ModalBuilder()
                            .setCustomId('bit')
                            .setTitle('Kanal bit hızını değiştirme');
                        const Input = new TextInputBuilder()
                            .setCustomId('InputBit')
                            .setPlaceholder('8 - 96 kbps')
                            .setLabel("Yeni bit hızı girin")
                            .setStyle(TextInputStyle.Short)
                            .setMinLength(1)
                            .setMaxLength(2)
                        firstActionRow = new ActionRowBuilder().addComponents(Input);
                        Modal.addComponents(firstActionRow);
                        await interaction.showModal(Modal);
                    }
                    if (interaction.customId === 'limit') {
                        const Modal = new ModalBuilder()
                            .setCustomId('limit')
                            .setTitle('Kullanıcı sınırını değiştir');
                        const Input = new TextInputBuilder()
                            .setCustomId('InputLimit')
                            .setPlaceholder('0 - 99')
                            .setLabel("Yeni bir kullanıcı sınırı girin")
                            .setStyle(TextInputStyle.Short)
                            .setMinLength(1)
                            .setMaxLength(2)
                        firstActionRow = new ActionRowBuilder().addComponents(Input);
                        Modal.addComponents(firstActionRow);
                        await interaction.showModal(Modal);
                    }
                    if (interaction.customId === 'kick') {
                        const Modal = new ModalBuilder()
                            .setCustomId('kick')
                            .setTitle('Kullanıcı sınırını değiştir');
                        const Input = new TextInputBuilder()
                            .setCustomId('InputKick')
                            .setPlaceholder('Kullanıcı İd')
                            .setLabel("kullanıcı kimliğini girin")
                            .setStyle(TextInputStyle.Short)
                            .setMinLength(1)
                            .setMaxLength(20)
                        firstActionRow = new ActionRowBuilder().addComponents(Input);
                        Modal.addComponents(firstActionRow);
                        await interaction.showModal(Modal);
                    }
                } else {
                    if (interaction.customId === 'delete') return;
                    await interaction.deferUpdate().catch(() => null)
                    return await interaction.followUp({ content: `Özel bir kanalınız yok.`, ephemeral: true })
                }
            }
        }
        if (interaction.isModalSubmit()) {
            if (interaction.customId === 'myModal') {
                const input = interaction.fields.getTextInputValue('Input');
                interaction.reply({ embeds: [new EmbedBuilder().setColor('BLURPLE').setDescription(`Yeni kanal adı \`${input}\``)], ephemeral: true })
                await interaction.member.voice.channel.setName(input).catch(() => null)
            }
            if (interaction.customId === 'bit') {
                let input = interaction.fields.getTextInputValue('InputBit');
                if (isNaN(input)) return interaction.reply({ embeds: [new EmbedBuilder().setColor(Config.colors.danger).setDescription(`Geçersiz bir numara girdiniz.`)], ephemeral: true })
                if (input > 96) input = 96
                if (input < 8) input = 8
                interaction.reply({ embeds: [new EmbedBuilder().setColor('BLURPLE').setDescription(`Yeni bit hızı seti \`${input}\``)], ephemeral: true })
                await interaction.member.voice.channel.setBitrate(input + `_000`).catch(() => null)
            }
            if (interaction.customId === 'limit') {
                let input = interaction.fields.getTextInputValue('InputLimit');
                if (isNaN(input)) return interaction.reply({ embeds: [new EmbedBuilder().setColor(Config.colors.danger).setDescription(`Geçersiz bir numara girdiniz.`)], ephemeral: true })
                interaction.reply({ embeds: [new EmbedBuilder().setColor('BLURPLE').setDescription(`Kullanıcı sınırı ayarlandı \`${input}\``)], ephemeral: true })
                await interaction.member.voice.channel.setUserLimit(input).catch(() => null)
            }
            if (interaction.customId === 'kick') {
                let user_data = await User.findOne({ userId: interaction.user.id });
                let input = interaction.fields.getTextInputValue('InputKick');
                interaction.guild.members.fetch(input).then(x => {
                    if (x.voice.channel.id !== user_data.private_voices.voiceId) return interaction.reply({ embeds: [new EmbedBuilder().setColor('BLURPLE').setDescription(`Belirtilen katılımcı bir ses kanalında değil.`)], ephemeral: true })
                    interaction.reply({ embeds: [new EmbedBuilder().setColor('BLURPLE').setDescription(`**${x.user.tag}**, ses kanalından atıldı.`)], ephemeral: true })
                    x.voice.disconnect()
                }, y => {
                    interaction.reply({ embeds: [new EmbedBuilder().setColor(Config.colors.danger).setDescription(`Geçersiz bir kimlik girdiniz.`)], ephemeral: true })
                }
                )
                await interaction.member.voice.channel.setUserLimit(input).catch(() => null)
            }
        }
        if (!interaction.isCommand()) return;
        if (!interaction.guild) return;

        await checkDB(interaction.user.id, interaction.guild.id)
        !(await GuildModel.findOne({ guildId: interaction.guild.id })) ? client.emit('guildCreate', interaction.guild) : null

        const cmd = client.commands.get(interaction.commandName)
        if (!cmd) return;

        interaction.guild.owner = await interaction.guild.fetchOwner()
        interaction.default = async (message, foo) => await interaction.reply({ embeds: [new EmbedBuilder({ description: message, color: Config.colors.success })], ephemeral: foo })

        if (cmd.permissions && !Config.developers.includes(interaction.user.id)) {
            let invalidPerms = []
            for (const perm of cmd.permissions) {
                if (!interaction.member.permissions.has(perm)) invalidPerms.push(Perms[perm]);
            }
            if (invalidPerms.length) {
                return await interaction.reply({ content: `Yeterli hakkınız yok: \`${invalidPerms}\``, ephemeral: true });
            }
        }

        if (cmd.forMePerms) {
            let invalidPerms = []
            for (const perm of cmd.forMePerms) {
                if (!interaction.guild.me.permissions.has(perm)) invalidPerms.push(Perms[perm]);
            }
            if (invalidPerms.length) {
                return await interaction.reply({ content: `Yeterli hakkım yok: \`${invalidPerms}\``, ephemeral: true });
            }
        }

        cmd.execute(client, interaction)
    }
}
