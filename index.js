/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
const venom = require('venom-bot');
const fs = require('fs');
const mime = require('mime-types');
const ffmpeg = require('fluent-ffmpeg');

venom
    .create()
    .then((client) => start(client));

async function start(client) {
  client.onMessage(async (message) => {
    // Mensagens personalizadas layout
    const customMessage = (content) => {
      client
          .reply(message.from, `*[BOT] ${content}`, message.id)
          .then(() => {
            console.log(`${message.sender.pushname}:`, message.body);
          })
          .catch((erro) => {
            console.error('Erro ao enviar mensagem: ', erro);
          });
    };

    // Help menssage
    if (message.body === '!help') {
      client
          .sendText(`${message.from}`,
              '*[BOT]* \n \n  Para criar uma figurinha digite *!sticker* \n \n Para criar uma figurinha animada digite *!gifsticker*',
          )
          .then(() => {
            console.log(`${message.sender.pushname}:`, message.body);
          })
          .catch((erro) => {
            console.error('Erro ao enviar mensagem: ', erro);
          });
    }

    // Image sticker
    if (message.type === 'image') {
      if (message.caption === '!sticker') {
        const buffer = await client.decryptFile(message);
        const fileName = `./files/img-sticker_${message.sender.pushname}+${message.sender.id}.${mime.extension(message.mimetype)}`;
        await fs.writeFile(fileName, buffer, (err) => {
          if (err) throw err;
          client
              .sendImageAsSticker(message.chatId, fileName)
              .then(() => {
                console.log(`${message.sender.pushname}:`, 'image');
              });
        });
      }
    }

    if (message.caption === '!gifsticker') {
      const buffer = await client.decryptFile(message);

      const videoFile = `./files/img-gif-sticker_${message.sender.pushname}+${message.sender.id}.${mime.extension(message.mimetype)}`;
      const gifFile = `./files/img-gif-sticker_tmp_${message.sender.pushname}+${message.sender.id}.${mime.extension('image/gif')}`;

      // Verificando se existe arquivos antigos e removendo-os
      if (fs.existsSync(videoFile)) {
        try {
          fs.unlinkSync(videoFile);
        } catch (err) {
          console.log('WARNING: unlinkSync', err);
        }
      }
      if (fs.existsSync(gifFile)) {
        try {
          fs.unlinkSync(gifFile);
        } catch (err) {
          console.log('WARNING: unlinkSync', err);
        }
      }

      // Enviando gifsticker
      const messageSend = () => {
        client
            .sendImageAsStickerGif(message.chatId, gifFile)
            .then((result) => {
              console.log('Result: ', result);
            });
      };

      // Convertendo o video(input) para gif(output)
      const convert = (input, output) => {
        ffmpeg(input)
            .output(output)
            .size('256x256')
            .run();
      };

      // Salvando o gif
      await fs.writeFileSync(gifFile, buffer, (err) => {
        if (err) throw err;
      });

      // Salvando o video
      fs.writeFile(videoFile, buffer, (err) => {
        if (err) throw err;
        try {
          convert(videoFile, gifFile);
        } catch (err) {
          console.log('convert_TRY_INSIDE_FUNCTION_ERROR: ', err);
        }
        setTimeout(messageSend, 500);
      });
    }

    // Mensagens personalizadas
    if (message.body === 'Renan') {
      customMessage('Renan é o caralho.');
    }

    if (message.body === 'Jeff') {
      customMessage('Jeff é a nordestina safada do grupo.');
    }

    if (message.body === 'QI') {
      customMessage('Seu QI de Leo do caralho.');
    }

    if (message.body === 'Léo' || message.body === 'Leo') {
      customMessage('Léo é o gordo todo fodido do grupo.\n Ele é tão gordo que o DDD muda, quando ele troca o celular de bolso');
    }

    if (message.body === 'Rafael') {
      customMessage('Rafael ou tê oitocentos, é o irmão afeminado e fracassado do Renan.');
    }
  });
}
