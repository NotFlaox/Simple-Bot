const { Client, Message, MessageEmbed } = require('discord.js');

module.exports = {
    name: 'ping',
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async (client, message, args) => {
        await message.guild.members.fetch().catch(() => { });
	message.channel.send(`${client.ws.ping}ms`)
    }
}