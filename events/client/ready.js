const { Client, MessageEmbed } = require('discord.js');
const db = require('quick.db');

module.exports = {
    name: "ready",
    /**
     * @param {Client} client
     */
    run: async (client) => {
        console.log(`${client.user.tag} is ready!`)

        client.db.pull = function(key, value) {
            const oldArray = client.db.get(key);
            const index = oldArray.indexOf(value);
            oldArray.splice(index, 1);
            client.db.set(key, oldArray);
        }}
    }