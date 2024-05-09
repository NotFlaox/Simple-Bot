const { Message, InteractionCollector, TextChannel, MessageButton, MessageActionRow } = require('discord.js');

Message.prototype.autoDelete = function (timeout = 5000) {
    setTimeout(() => this.delete(), timeout);
}

InteractionCollector.prototype.autoClose = function (msg) {
    this.on('end', () => {
        if (msg.author) msg.edit({ components: [] }).catch(() => { });
        else if (msg.user) msg.editReply({ components: [] }).catch(() => { });
    })
}

TextChannel.prototype.forceBulkDelete = async function (count) {
    const boucles = Math.floor(count / 99);
    const add = count - boucles;

    var deleted = 0;
    if (boucles !== 0) {
        for (var i = 0; i < boucles; i++) {
            await this.bulkDelete(99).then((msgs) => deleted += msgs.size).catch(() => { })
        }
    }
    await this.bulkDelete(add).then((msgs) => deleted += msgs.size).catch(() => { })

    return deleted;
}

Message.prototype.pagination_map = async function (value, embed, max = 20) {

    let valuePerPages = max,
        i0 = 0,
        i1 = valuePerPages,
        page = 1,
        totalPage = Math.ceil(value.length / i1);

    const generateMessage = () => {
        const back = new MessageButton()
            .setCustomId(`back${this.id}`)
            .setStyle('PRIMARY')
            .setLabel('◀');

        const next = new MessageButton()
            .setCustomId(`next${this.id}`)
            .setStyle('PRIMARY')
            .setLabel('▶');

        const row = new MessageActionRow().addComponents([back, next]);

        embed.description = value.slice(i0, i1).join("\n");
        if (embed.footer) embed.footer.text = embed.footer.text.replaceAll('{page}', page).replaceAll('{total_page}', totalPage === 0 ? 1 : totalPage)

        let output;
        value.length > valuePerPages ? output = { embeds: [embed], components: [row] } : output = { embeds: [embed] }
        return output;
    }

    const msg = await this.channel.send(generateMessage());

    this.channel.createMessageComponentCollector({
        filter: i => ['BUTTON'].includes(i.componentType) && i.user.id === this.author.id && i.message.id === msg.id,
        time: 60 * 1000
    }).on('collect', async (interaction) => {

        let { customId } = interaction;

        customId = customId.replace(this.id, '');

        if (interaction.user.id !== this.author.id) {
            return interaction.reply({ content: 'Seul l\'utilisateur ayant fait la commande peut utiliser cette interaction', ephemeral: true })
        }

        await interaction.deferUpdate().catch(() => { });

        if (customId === 'next') {

            i0 = i0 + valuePerPages;
            i1 = i1 + valuePerPages;
            page = page + 1;

            if (page > totalPage) {
                i0 = 0;
                i1 = valuePerPages;
                page = 1;
            }

            msg.edit(generateMessage()).catch(() => { });

        }
        else if (customId === 'back') {

            i0 = i0 - valuePerPages;
            i1 = i1 - valuePerPages;
            page = page - 1;

            if (page <= 0) {
                i0 = valuePerPages * totalPage - valuePerPages;
                i1 = valuePerPages * totalPage;
                page = totalPage;
            }

            msg.edit(generateMessage()).catch(() => { });

        }
    }).autoClose(msg);
}

Message.prototype.pagination = async function (...embeds) {

    let page = 1,
        totalPage = embeds.length;

    const generateMessage = () => {
        const back = new MessageButton()
            .setCustomId(`back${this.id}`)
            .setStyle('PRIMARY')
            .setLabel('◀');

        const next = new MessageButton()
            .setCustomId(`next${this.id}`)
            .setStyle('PRIMARY')
            .setLabel('▶');

        const row = new MessageActionRow().addComponents([back, next]);

        return { embeds: [embeds[page - 1]], components: [row] };
    }

    const msg = await this.channel.send(generateMessage());

    this.channel.createMessageComponentCollector({
        filter: i => ['BUTTON'].includes(i.componentType) && i.user.id === this.author.id && i.message.id === msg.id,
        time: 60 * 1000
    }).on('collect', async (interaction) => {

        let { customId } = interaction;

        customId = customId.replace(this.id, '');

        if (interaction.user.id !== this.author.id) {
            return interaction.reply({ content: 'Seul l\'utilisateur ayant fait la commande peut utiliser cette interaction', ephemeral: true })
        }

        await interaction.deferUpdate().catch(() => { });

        if (customId === 'next') {

            page = page + 1;

            if (page > totalPage) {
                page = 1;
            }

            msg.edit(generateMessage()).catch(() => { });

        }
        else if (customId === 'back') {

            page = page - 1;

            if (page <= 0) {
                page = totalPage;
            }

            msg.edit(generateMessage()).catch(() => { });

        }
    }).autoClose(msg);
}