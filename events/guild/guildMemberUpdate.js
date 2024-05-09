const { Client, GuildMember, MessageEmbed } = require('discord.js');

module.exports = {
    name: 'guildMemberUpdate',
    /**
     * @param {Client} client
     * @param {GuildMember} oldMember
     * @param {GuildMember} newMember
     */
    run: async (client, oldMember, newMember) => {
        const { removerolelogs } = client.config;
        const { addrolelogs } = client.config;
        
        if (!newMember.guild) return;

        const audits = await newMember.guild.fetchAuditLogs().catch(() => { })
        const audit = audits.entries.first();
        if (!audit) return;

        if (audit.action === "MEMBER_ROLE_UPDATE") {
            const addedRoles = [];
            newMember.roles.cache.forEach((role) => {
                if (!oldMember.roles.cache.has(role.id)) addedRoles.push(role);
            });

            const removedRoles = [];
            oldMember.roles.cache.forEach((role) => {
                if (!newMember.roles.cache.has(role.id)) removedRoles.push(role);
            });

            if (addedRoles.length) {
                const logs_embed = new MessageEmbed()
                    .setAuthor({ name: audit.executor.tag, iconURL: audit.executor.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`📥 ${audit.executor.tag} added the role <@&${addedRoles[0].id}> à ${newMember.user.tag}${audit.reason ? `\nReason : ${audit.reason}` : ''}`)
                    .setColor("FF0000")

                const log = newMember.guild.channels.cache.get(`${addrolelogs}`)
                if (log) return log.send({ embeds: [logs_embed] })
            }
            if (removedRoles.length) {
                const logs_embed = new MessageEmbed()
                    .setAuthor({ name: audit.executor.tag, iconURL: audit.executor.displayAvatarURL({ dynamic: true }) })
                    .setDescription(`📤 ${audit.executor.tag} removed the role <@&${removedRoles[0].id}> à ${newMember.user.tag}${audit.reason ? `\nReason : ${audit.reason}` : ''}`)
                    .setColor("FF0000")

                const log = newMember.guild.channels.cache.get(`${removerolelogs}`)
                if (log) return log.send({ embeds: [logs_embed] })
            }
        }
    }
}