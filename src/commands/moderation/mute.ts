import {
  PermissionsBitField,
  SlashCommandSubcommandBuilder,
  type ChatInputCommandInteraction
} from "discord.js";
import ms from "ms";
import { errorCheck, modEmbed } from "../../utils/embeds/modEmbed";

export default class Mute {
  data: SlashCommandSubcommandBuilder;
  constructor() {
    this.data = new SlashCommandSubcommandBuilder()
      .setName("mute")
      .setDescription("Mutes a user.")
      .addUserOption(user =>
        user.setName("user").setDescription("The user that you want to mute.").setRequired(true)
      )
      .addStringOption(string =>
        string
          .setName("duration")
          .setDescription("The duration of the mute (e.g 30m, 1d, 2h).")
          .setRequired(true)
      )
      .addStringOption(string =>
        string.setName("reason").setDescription("The reason for the mute.")
      );
  }

  async run(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser("user")!;
    const duration = interaction.options.getString("duration")!;
    const reason = interaction.options.getString("reason");

    errorCheck(PermissionsBitField.Flags.MuteMembers, {
      interaction,
      user,
      action: "Mute",
      duration
    });

    const time = new Date(
      Date.parse(new Date().toISOString()) + Date.parse(new Date(ms(duration)).toISOString())
    ).toISOString();

    await interaction.guild?.members.cache
      .get(user.id)
      ?.edit({ communicationDisabledUntil: time, reason: reason ?? undefined })
      .catch(error => console.error(error));

    await modEmbed({ interaction, user, action: "Muted", duration }, reason);
  }
}
