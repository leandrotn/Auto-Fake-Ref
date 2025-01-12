const { Client } = require('discord.js-selfbot-v13');
const client = new Client();
const idcanalpush = '1324062284770709615'; // ID do canal de texto a ser analisado
const idservidopush = '1200171500553113711'; // ID do servidor do canal a ser analisado

const idcanalpull = '1327857824851820627'; // ID do canal onde a mensagem será enviada
const idservidorpull = '1327857824851820624'; // ID do servidor do canal onde a mensagem será enviada

const sentMessageIds = new Set(); 

async function fetchAllMessages(channel) {
  let allMessages = [];
  let lastMessageId = null;
  let hasMoreMessages = true;

  while (hasMoreMessages) {
    const options = { limit: 100 };
    if (lastMessageId) {
      options.before = lastMessageId;
    }

    const messages = await channel.messages.fetch(options);

    if (messages.size === 0) {
      hasMoreMessages = false;
    } else {
      allMessages = Array.from(messages.values()).concat(allMessages);
      lastMessageId = messages.last().id;
    }
  }

  return allMessages;
}

async function analyzeMessagesAndSend(client) {
  try {
    const sourceGuild = await client.guilds.fetch(idservidopush);
    const sourceChannel = await sourceGuild.channels.fetch(idcanalpush);

    if (!sourceChannel.isText()) {
      console.log('O canal especificado não é um canal de texto.');
      return;
    }

    const allMessages = await fetchAllMessages(sourceChannel);

    const targetGuild = await client.guilds.fetch(idservidorpull);
    const targetChannel = await targetGuild.channels.fetch(idcanalpull);

    if (!targetChannel.isText()) {
      console.log('O canal de destino especificado não é um canal de texto.');
      return;
    }

    let imageCounter = 0; // Iniciar contagem a partir de 0

    async function sendMessage(message) {
      if (!sentMessageIds.has(message.id)) {
        sentMessageIds.add(message.id);

        if (message.attachments.size > 0) {
          for (const attachment of message.attachments.values()) {
            console.log(`Enviando imagem: ${attachment.url}`);
            await targetChannel.send({ 
              content: `## 🪙 | ENTREGA CONCLUÍDA #${imageCounter + 1}
> Convide +3 amigos = recebeu;

➡️   \`[ENVIO IMEDIATO]\``, 
              files: [attachment.url] 
            });
            imageCounter++;
          }
        }
      }
    }

    async function sendMessagesSequentially(messages) {
      for (const message of messages) {
        await sendMessage(message);
        await new Promise(resolve => setTimeout(resolve, 60000));   //ajusta o time
      }
    }

    await sendMessagesSequentially(allMessages); 

    if (sourceChannel.isText()) {
      const filter = (message) => !sentMessageIds.has(message.id) && message.attachments.size > 0;
      const collector = sourceChannel.createMessageCollector({ filter });

      collector.on('collect', async (message) => {
        await sendMessage(message);
      });
    }

  } catch (error) {
    console.error('Erro ao processar e enviar mensagens:', error);
  }
}

client.on('ready', async () => {
  console.log(`${client.user.username} is ready!`);
  await analyzeMessagesAndSend(client);
});

client.login('MTMyNjAwNzYzMzcxMDI4ODkzMQ.GVJFuZ.dwwxTel_AucZQOhseZLaYUplutOlCzUdv-IDrA');
