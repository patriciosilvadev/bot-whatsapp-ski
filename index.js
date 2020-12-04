const venom = require('venom-bot');
const fs = require('fs');
const mime = require('mime-types');
const ffmpeg = require('fluent-ffmpeg');
const { setTimeout } = require('timers');
venom
  .create()
  .then((client) => start(client));

async function start(client)  {
  client.onMessage(async (message) => {

    // Help menssage
    if (message.body === '!help') {
      client
        .sendText(`${message.from}`, 
        '*[BOT}* \n \n  Para criar uma figurinha digite *!sticker* \n \n Para criar uma figurinha animada digite *!gifsticker*'
        )
        .then(() => {
          console.log(`${message.sender.pushname}:`, message.body);
        })
        .catch((erro) => {
          console.error('Erro ao enviar mensagem: ', erro);
        });
    }

    if (message.body === 'Renan') {
      client
        .sendText(`${message.from}`, '*[BOT] Renan é o caralho.*')
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
        console.log('mensagem:', message);
        await fs.writeFile(fileName, buffer, (err) => {
          if (err) throw err;
          client
          .sendImageAsSticker(message.chatId, fileName)
          .then((result) => {
            console.log(`${message.sender.pushname}:`, 'image');
          })
        });
      }
    }

    // Gif sticker
    if (message.mimetype === 'image/gif') {
      const buffer = await client.decryptFile(message);
      const fileName = `./files/img-gif-sticker_${message.sender.pushname}+${message.sender.id}.${mime.extension(message.mimetype)}`;
      
      await fs.writeFile(fileName, buffer, () => {
        client
        .sendImageAsStickerGif(message.chatId, fileName)
        .then(() => {
          console.log(`${message.sender.pushname}:`, 'gif');
        })
      }).catch((err) => {
        throw err;
      });
    }

    // Gif sticker
    if (message.caption === '!gifsticker') {
      const buffer = await client.decryptFile(message);
      const fileName = `./files/img-gif-sticker_${message.sender.pushname}+${message.sender.id}.${mime.extension(message.mimetype)}`;
      const tmpFileName = `./files/img-gif-sticker_tmp_${message.sender.pushname}+${message.sender.id}.${mime.extension('image/gif')}`;

      const messageSend = () => {
        client
        .sendImageAsStickerGif(message.chatId, tmpFileName)
        .then(() => {
          console.log(`${message.sender.pushname}:`, 'gif');
          
        })
      }
      const convert = (input, output) => {
        ffmpeg(input)
          .output(output)
          .size('256x256')
          .on('end', () => {                    
            client
            .sendText(`${message.from}`, '*[BOT]* Espera 10 segundinhos ae, corno')
          }).on('error', (err) => {
            console.log('error: ', err.code, err.msg);
          }).run();
      }
      await fs.writeFileSync(tmpFileName, buffer, (err) => {
        if(err) throw err;
      });

      fs.writeFile(fileName, buffer, (err) => {
        if(err) throw err;

        convert(fileName, tmpFileName)
        setTimeout(messageSend, 3000);
      });
    }
	});
}