const { Client, Collection } = require('discord.js');
const fs = require('fs');
const db = require("quick.db");
const Discord = require("djs-chalk")

class client extends Client {
    constructor() {
        super({
            intents: 32767,
            partials: ['MESSAGE', 'REACTION', 'CHANNEL'],
            shards: "auto",
            restTimeOffset: 0
        });

        this.db = db;
        this.config = require("../config");
        this.functions = require("../utils/index");
        this.cache = {};

        this.commands = new Collection();
        this.aliases = new Collection();

        this.initCommands();
        this.initEvents();

        require('../utils/extenders');

        this.login(this.config.token);
    }

    initCommands() {
        const subFolders = fs.readdirSync("./commands")
        for (const category of subFolders) {
            const commandsFiles = fs.readdirSync(`./commands/${category}`).filter(file => file.endsWith('.js'))
            for (const commandFile of commandsFiles) {
                const command = require(`../commands/${category}/${commandFile}`)
                this.commands.set(command.name, command)
                if (command.aliases && command.aliases.length > 0) {
                    command.aliases.forEach(alias => this.aliases.set(alias, command))
                }
            }
        }
    }

    initEvents() {
        const subFolders = fs.readdirSync("./events")
        for (const category of subFolders) {
            const eventsFiles = fs.readdirSync(`./events/${category}`).filter(file => file.endsWith(".js"))
            for (const eventFile of eventsFiles) {
                const event = require(`../events/${category}/${eventFile}`)
                this.on(event.name, (...args) => event.run(this, ...args))
            }
        }
    }
}

module.exports = client;

process
    .on("uncaughtException", err => console.error(err))
    .on("unhandledRejection", err => console.error(err));