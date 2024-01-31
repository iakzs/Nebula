import {
  SlashCommandSubcommandBuilder,
  EmbedBuilder,
  PermissionsBitField,
  TextChannel,
  type ChatInputCommandInteraction
} from "discord.js";
import { genColor } from "../../../utils/colorGen";
import { errorEmbed } from "../../../utils/embeds/errorEmbed";
import { deleteNews } from "../../../utils/database/news";

export default class Remove {
  data: SlashCommandSubcommandBuilder;
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("remove")
      .setDescription("Removes news from your guild.")
      .addStringOption(option =>
        option
          .setName("id")
          .setDescription("The ID of the news. Found in the footer of the news.")
          .setRequired(true)
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const user = interaction.user;
    const guild = interaction.guild!;
    const id = interaction.options.getString("id")!;
    const member = guild.members.cache.get(user.id)!;

    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild))
      return await interaction.followUp({
        embeds: [errorEmbed("You need **Manage Server** permissions to delete news.")]
      });

    const subscribedChannel = await newsTable
      ?.get(`${guild.id}.channel`)
      .then(channel => channel as { channelId: string; roleId: string })
      .catch(() => {
        return { channelId: null, roleId: null };
      });

    if (!news)
      return await interaction.reply({
        embeds: [errorEmbed("The specified news doesn't exist.")]
      });

    const messageId = news?.messageId;
    const newsChannel = (await interaction.guild.channels
      .fetch(subscribedChannel?.channelId ?? "")
      .catch(() => null)) as TextChannel | null;
    if (newsChannel) await newsChannel?.messages.delete(messageId).catch(() => null);

    deleteNews(id);
    await interaction.reply({
      embeds: [new EmbedBuilder().setTitle("✅ • News deleted!").setColor(genColor(100))]
    });
  }
}