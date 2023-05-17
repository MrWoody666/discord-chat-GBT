const { Events } = require('discord.js');
const { openai } = require('../../../index');
const { generatePrompt } = require('./prompt.js');
const color = require('../../utils/logger');

const requestQueue = [];

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot || !message.mentions.has(message.client.user.id)) {
      return;
    }

    try {
      const messageHistory = await message.channel.messages.fetch({ limit: 5 });
      const formattedMessages = messageHistory
        .filter(msg => !msg.author.bot)
        .map(msg => ({
          role: "user",
          name: msg.author.username.replace(/ /g, "_").replace(/[^a-z0-9]+/gi, '_'),
          content: msg.cleanContent
        }));

      const payload = formattedMessages.concat(generatePrompt(message));

      await message.channel.sendTyping();

      requestQueue.push({ message, payload });

      if (requestQueue.length === 1) {
        processNextRequest();
      } else {
        const queuePosition = requestQueue.length;
        const replyMessage = `Ваш запрос отправлен в обработку. Пожалуйста, подождите... (Позиция в очереди: ${queuePosition})`;
        message.reply(replyMessage);
      }
    } catch (error) {
      color.error(error);
    }
  }
};

async function processNextRequest() {
  if (requestQueue.length === 0) {
    return;
  }

  const { message, payload } = requestQueue[0];

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: payload,
      temperature: 1.0,
      max_tokens: 2000,
    });

    const content = response.data.choices[0].message.content;
    if (content.length > 2000) {
      const messages = content.match(/.{1,1999}/g);
      for (const messageContent of messages) {
        await message.channel.send(messageContent);
      }
    } else {
      await message.reply(content);
    }
  } catch (error) {
    color.error(error);
  }

  requestQueue.shift();

  if (requestQueue.length > 0) {
    setTimeout(processNextRequest, 7000);
  }
}
