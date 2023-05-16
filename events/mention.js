const { Events, MessageMentions } = require('discord.js');
const { openai } = require('../index.js');
const { generatePrompt } = require('../prompts/prompt.js');

module.exports = {
  name: Events.MessageCreate,
  async execute(message) {
    if (message.author.bot) {
      return;
    }

    if (message.mentions.has(message.client.user.id)) {
      const messageHistory = await message.channel.messages.fetch({ limit: 5 });
      messageHistory.reverse();
      messageHistory.delete(messageHistory.lastKey());
      const formattedMessages = messageHistory.map((msg) => ({
        role: msg.author.bot === true ? "assistant" : "user",
        name: msg.author.username.replace(/ /g, "_").replace(/[^a-z0-9]+/gi, '_'),
        content: msg.cleanContent
      }));
      const payload = formattedMessages.concat(generatePrompt(message));
      await message.channel.sendTyping();
      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: payload,
        temperature: 1.0,
        max_tokens: 2000,
      });

      if (response.data.choices[0].message.content.length > 2000) {
        const messages = response.data.choices[0].message.content.match(/.{1,1999}/g);
        for (const messageContent of messages) {
          await message.channel.send(messageContent);
        }
      } else {
        message.reply(response.data.choices[0].message.content);
      }
    }
  }
};
