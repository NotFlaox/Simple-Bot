const { Client, Message, MessageEmbed } = require('discord.js');

module.exports = {
	name: 'messageCreate',
	/**
	 * @param {Client} client
	 * @param {Message} message
	 */
	run: async (client, message) => {
		if (!message.guild) return;
		if (message.author.bot) return;

		const { prefix } = client.config;
		if (!message.author || message.author.bot) return;

		const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${prefix?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\s*`);
		if (!prefixRegex.test(message.content)) return;

		if (message.content === `<@${client.user.id}>` || message.content === `<@!${client.user.id}>`) return message.channel.send(`Mon prefix sur ce serveur est: \`${prefix}\``);

		if (message.content.length === prefix.length) return;
		const [, matchedPrefix] = message.content.match(prefixRegex)

		let args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
		const command = args.shift()?.toLowerCase();

		const cmd = client.commands.get(command) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(command));
		if (!cmd) return;

		cmd.run(client, message, args);
	}
}