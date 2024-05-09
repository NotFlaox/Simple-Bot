const { Client, Message } = require('discord.js');

module.exports = {
    name: "message",
    /**
     * @param {Client} client
     * @param {Message} message
     * @param {String[]} args
     */
    run: async (client, message, args) => {
        const { reference } = message;

        if (!reference) return;

        const { messageId } = reference;

        const { cleanContent, embeds, components } = await message.channel.messages.fetch(messageId);

        console.log('content:', cleanContent);

        for (let i = 0; i < embeds.length; i++) {
            const embed = embeds[i];
            console.log(`embed ${i}`, embed);
        }

        for (let i = 0; i < components.length; i++) {
            const component = components[i];
            console.log(`component ${i}`, component.components[0]);
        }
        
    }
}