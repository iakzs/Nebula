import {
  ChannelType,
  EmbedBuilder,
  PermissionsBitField,
  SlashCommandSubcommandBuilder,
  type ChatInputCommandInteraction
} from "discord.js";
import { genColor } from "../../utils/colorGen";
import { errorEmbed } from "../../utils/embeds/errorEmbed";
import { logChannel } from "../../utils/logChannel";

export default class Unlock {
  data: SlashCommandSubcommandBuilder;
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("unlock")
      .setDescription("Unlocks a channel.")
      .addChannelOption(channel =>
        channel
          .setName("channel")
          .setDescription("The channel that you want to unlock.")
          .addChannelTypes(
            ChannelType.GuildText,
            ChannelType.PublicThread,
            ChannelType.PrivateThread,
            ChannelType.GuildVoice
          )
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild!;
    const member = guild.members.cache.get(interaction.member?.user.id!)!;

    if (!member.permissions.has(PermissionsBitField.Flags.ManageRoles))
      return errorEmbed(
        interaction,
        "You can't execute this command",
        "You need the **Manage Roles** permission."
      );

    const channelOption = interaction.options.getChannel("channel")!;
    const channel = guild.channels.cache.get(interaction.channel?.id ?? channelOption.id)!;

    if (channel.permissionsFor(guild.id)?.has("SendMessages"))
      return errorEmbed(
        interaction,
        "You can't execute this command.",
        "The channel is not locked."
      );

    const embed = new EmbedBuilder()
      .setTitle(`Unlocked a channel`)
      .setDescription(
        [
          `**Moderator**: ${interaction.user.username}`,
          `**Channel**: ${channelOption ?? `<#${channel.id}>`}`
        ].join("\n")
      )
      .setColor(genColor(100));

    if (
      channel.type === ChannelType.GuildText &&
      ChannelType.PublicThread &&
      ChannelType.PrivateThread &&
      ChannelType.GuildVoice
    )
      channel.permissionOverwrites
        .create(interaction.guild!.id, {
          SendMessages: null,
          SendMessagesInThreads: null,
          CreatePublicThreads: null,
          CreatePrivateThreads: null,
          UseApplicationCommands: null,
          UseEmbeddedActivities: null
        })
        .catch(error => console.error(error));

    await logChannel(guild, embed);
    await interaction.reply({ embeds: [embed] });
  }
}