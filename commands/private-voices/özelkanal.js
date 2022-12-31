const { Client, CommandInteraction, ButtonBuilder, ActionRowBuilder, EmbedBuilder, ChannelType, PermissionsBitField, UserFlagsBitField, ButtonStyle } = require('discord.js')
const { SlashCommandBuilder, Embed } = require('@discordjs/builders')
const Guild = require('../../models/Guild');

module.exports = {
    slash: new SlashCommandBuilder()
        .setName('özel-kanal')
        .setDescription("Özel ses kanalları oluşturun."),
    /**
     * @param {Client} client
     * @param {CommandInteraction} interaction
     */
    async execute(client, interaction) {
        let data = await Guild.findOne({ guildId: interaction.guild.id });
        if (!data) {
            await Guild.create({ guildId: interaction.guild.id });
        }
        let newdata = await Guild.findOne({ guildId: interaction.guild.id });
        if (newdata?.private_voices?.categoryId && newdata?.private_voices?.channelId != null) {
            let btn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('delete').setLabel('Sil').setStyle(ButtonStyle.Danger))
            let message = await interaction.channel.send({ embeds: [new EmbedBuilder().setColor('BLURPLE').setDescription('Özel odalar sistemi zaten var silinsin mi?')], components: [btn] })
            setTimeout(() => {
                message.edit({ components: [] }).catch(() => null)
            }, 20 * 1000);
            let collector = message.createMessageComponentCollector()
            collector.on('collect', async (i) => {
                if (interaction.user.id != i.user.id) return i.deferUpdate().catcha(() => null);
                if (i.customId == 'delete') {
                    message.edit({ components: [], content: `Özel Oda Sistemi Kaldırıldı ✅` })
                    let data = await Guild.findOne({ guildId: interaction.guild.id })
                    let channelId = await client.channels.fetch(data?.private_voices?.channelId).catch(() => null)
                    let textId = await client.channels.fetch(data?.private_voices?.textId).catch(() => null)
                    let categoryId = await client.channels.fetch(data?.private_voices?.categoryId).catch(() => null)
                    channelId?.delete().catch(() => null)
                    textId?.delete().catch(() => null)
                    categoryId?.delete().catch(() => null)
                    return await Guild.updateOne({ guildId: interaction.guild.id }, {
                        $set: {
                            'private_voices': {}
                        }
                    })
                }
            })
        } else {
            let categoryId = await interaction.guild.channels.create({
                name: `Join To Create [+]`,
                type: ChannelType.GuildCategory,
            })
            let channelId = await interaction.guild.channels.create({
                name: `Create [+]`,
                type: ChannelType.GuildVoice,
                parent: categoryId,
                userLimit: 1,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        allow: [PermissionsBitField.Flags.Connect],
                        deny: [PermissionsBitField.Flags.Speak]
                    }
                ]
            })
            let textId = await interaction.guild.channels.create({
                name: `settigs`,
                parent: categoryId,
                topic: `Özel kanal yönetimi`,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.SendMessages]
                    }
                ]
            })
            let rename = new ButtonBuilder().setCustomId('rename').setLabel("İsim Değiştir").setEmoji('✏️').setStyle(ButtonStyle.Secondary);
            let lock = new ButtonBuilder().setCustomId('lock').setLabel("Kilit").setEmoji('🔒').setStyle(ButtonStyle.Secondary);
            let bit = new ButtonBuilder().setCustomId('bit').setLabel("Bit Hızı").setEmoji('📻').setStyle(ButtonStyle.Secondary)
            let limit = new ButtonBuilder().setCustomId('limit').setLabel("Oda Limiti").setEmoji('🫂').setStyle(ButtonStyle.Secondary)
            let kick = new ButtonBuilder().setCustomId('kick').setLabel("Sesten At").setEmoji('🚫').setStyle(ButtonStyle.Secondary)

            let Buttons = new ActionRowBuilder().addComponents([lock, rename, bit, limit, kick])

            let Embed = new EmbedBuilder().setAuthor({ name: `${interaction.guild.name} Özel kanal yönetimi`, iconURL: interaction.guild.iconURL() })
                .setDescription(`\`\`\`diff\n${interaction.guild.name} Sunucusunda ki özel oda sistemi bu panel ile ayarlana bilir aşağıda ki butonları kullanarak özel odanızı ayarlaya bilirsiniz\`\`\``)
                .setColor('2F3136')
                .setThumbnail(interaction.guild.iconURL({ dynamic:true, size: 2048}))
            textId.send({ embeds: [Embed], components: [Buttons] })
            await Guild.updateOne({ guildId: interaction.guild.id }, {
                $set: {
                    'private_voices.mode': true,
                    'private_voices.categoryId': categoryId,
                    'private_voices.channelId': channelId,
                    'private_voices.textId': textId,
                }
            })

            await interaction.reply({ content: `Kanallar başarıyla oluşturuldu.` })
        }
    }
}