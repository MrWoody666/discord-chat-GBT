const { Events } = require('discord.js');
const { openai } = require('../../../index');
const { generatePrompt } = require('./prompt.js');
const color = require('../../utils/logger');

const requestQueue = [];
let isProcessing = false; // Флаг для отслеживания обработки запросов

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

      if (!isProcessing) { // Если обработка запросов уже выполняется, то новый запрос добавляется в очередь
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
    isProcessing = false; // Обработка очереди завершена
    return;
  }

  isProcessing = true; // Устанавливаем флаг, что обработка запросов выполняется

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
        await delay(3000); // Задержка 3 секунды между отправкой сообщений
      }
    } else {
      await message.reply(content);
    }
  } catch (error) {
    color.error(error);
  }

  requestQueue.shift();

  if (requestQueue.length > 0) {
    setTimeout(processNextRequest, 10000); // Задержка 10 секунд перед обработкой следующего запроса
  } else {
    isProcessing = false; // Обработка очереди завершена
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
} 