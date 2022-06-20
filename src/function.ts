import {
  delay,
  DownloadableMessage,
  downloadContentFromMessage,
  GroupParticipant,
  isJidGroup,
  proto,
} from "@adiwajshing/baileys";
import fs from "fs";
import { writeFile } from "fs/promises";
import path from "path";
import { general } from "./configuration/general";
import { IBotData } from "./Interface/IBotData";

export const getBotData = (
  socket: any,
  webMessage: proto.IWebMessageInfo
): IBotData => {

  const { remoteJid } = webMessage.key;

  const presenceTime = async (delayComposing: number, delayPaused: number) => {
    await socket.presenceSubscribe(remoteJid)
    await delay(delayComposing)
    await socket.sendPresenceUpdate('composing', remoteJid)
    await delay(delayPaused)
    await socket.sendPresenceUpdate('paused', remoteJid)
  }

  const sendText = async (ass: boolean, text: string) => {
    let assinatura = ass ? `${general.prefixEmoji} *${general.botName}:* \n` : '';
    return await socket.sendMessage(remoteJid, {
      text: `${assinatura}${text}`,
    });
  };

  const sendButton = async (mensagem: string, textBtn1: string, textBtn2: string, textBtn3?: string) => {

    const buttons = [
      { buttonId: 'id1', buttonText: { displayText: textBtn1 }, type: 1 },
      { buttonId: 'id2', buttonText: { displayText: textBtn2 }, type: 1 }
    ]

    if (textBtn3 !== undefined) {
      buttons.push({ buttonId: 'id3', buttonText: { displayText: textBtn3 }, type: 1 })
    }

    const buttonMessage = {
      text: `${general.prefixEmoji} *${general.botName}:* \n${mensagem}`,
      buttons: buttons,
      headerType: 1
    }

    return await socket.sendMessage(remoteJid, buttonMessage)
  }

  const sendMenu = async (nome: string) => {
    const sections = [
      {
        rows: [
          { title: "Criar Teste", rowId: "#criarteste" },
          { title: "Solicitar Pix", rowId: "#pix" },
          { title: "Meu Login", rowId: "#meulogin" },
        ]
      },
    ]

    const listMessage = {
      text: `${nome} aqui está nosso menu fique a vontade para gerar seu teste, solicitar pagamento e receber seu login mensal.`,
      footer: "Aperte menu e escolha uma opção",
      title: `${general.prefixEmoji} *${general.botName}:*`,
      buttonText: "Menu",
      sections
    }

    return await socket.sendMessage(remoteJid, listMessage);
  };

  const reply = async (text: string) => {

    return await socket.sendMessage(
      webMessage.key.remoteJid,
      { text: `${general.prefixEmoji} *${general.botName}:* \n${text}` },
      { quoted: webMessage }
    );
  };

  const sendImage = async (
    pathOrBuffer: string | Buffer,
    caption = "",
    isReply = true
  ) => {
    let options = {};

    if (isReply) {
      options = {
        quoted: webMessage,
      };
    }

    const image =
      pathOrBuffer instanceof Buffer
        ? pathOrBuffer
        : fs.readFileSync(pathOrBuffer);

    const params = caption
      ? {
        image,
        caption: `${general.prefixEmoji} *${general.botName}:* \n${caption}`,
      }
      : { image };

    return await socket.sendMessage(remoteJid, params, options);
  };

  const sendSticker = async (pathOrBuffer: string | Buffer, isReply = true) => {
    let options = {};

    if (isReply) {
      options = {
        quoted: webMessage,
      };
    }

    const sticker =
      pathOrBuffer instanceof Buffer
        ? pathOrBuffer
        : fs.readFileSync(pathOrBuffer);

    return await socket.sendMessage(remoteJid, { sticker }, options);
  };

  const sendAudio = async (
    pathOrBuffer: string | Buffer,
    isReply = true,
    ptt = true
  ) => {
    let options = {};

    if (isReply) {
      options = {
        quoted: webMessage,
      };
    }

    const audio =
      pathOrBuffer instanceof Buffer
        ? pathOrBuffer
        : fs.readFileSync(pathOrBuffer);

    if (pathOrBuffer instanceof Buffer) {
      return await socket.sendMessage(
        remoteJid,
        {
          audio,
          ptt,
          mimetype: "audio/mpeg",
        },
        options
      );
    }

    options = { ...options, url: pathOrBuffer };

    return await socket.sendMessage(
      remoteJid,
      {
        audio: { url: pathOrBuffer },
        ptt,
        mimetype: "audio/mpeg",
      },
      options
    );
  };

  const sendApk = async () => {

    const pathAPK = path.join(__dirname, "..", "cache", "app.apk");
    const buffer = fs.readFileSync(pathAPK);


    return await socket.sendMessage(
      remoteJid,
      {
        document: buffer,
        mimetype: "application/vnd.android.package-archive",
        fileName: "LuccasNet.apk"
      }
    );
  };

  const {
    messageText,
    isImage,
    isVideo,
    isSticker,
    isAudio,
    isDocument,
    userJid,
    replyJid,
  } = extractDataFromWebMessage(webMessage);

  const { command, args } = extractCommandAndArgs(messageText);

  return {
    presenceTime,
    sendButton,
    sendMenu,
    sendText,
    sendImage,
    sendSticker,
    sendAudio,
    sendApk,
    reply,
    remoteJid,
    userJid,
    replyJid,
    socket,
    webMessage,
    command,
    args,
    isImage,
    isVideo,
    isSticker,
    isAudio,
    isDocument,
    messageText
  };
};

export const clearEmotionAndEspace = (text: string) => {
  return text.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g, '').trim();
}

export const isCriarTeste = (dataCadastro: string) => {
  if (dataCadastro) {
    try {
      var data = new Date(dataCadastro)
      return Math.floor((new Date().getTime() - data.getTime()) / (1000 * 60 * 60 * 24)) > 0;
    } catch (error) {
      console.log('Erro ao tentar converter data no metodos function isCriarTeste')
    }
  } else {
    return true
  }
}

export const isCriarPix = (dataPix: string) => {
  if (dataPix) {
    try {
      var data = new Date(dataPix)
      let resposta = Math.floor((new Date().getTime() - data.getTime()) / (1000 * 60 * 60 * 24)) > 0;
      return resposta;
    } catch (error) {
      console.log('Erro ao tentar converter data no metodos function isCriarTeste')
    }
  } else {
    return true
  }
}

export const getCommand = (commandName: string) => {
  const pathCache = path.join(__dirname, "..", "cache", "commands.json");
  const pathCommands = path.join(__dirname, "commands");

  const cacheCommands = readJSON(pathCache);

  if (!commandName) return;

  const cacheCommand = cacheCommands.find(
    (name: string) => name === commandName
  );

  if (!cacheCommand) {
    const command = fs
      .readdirSync(pathCommands)
      .find((file) => file.includes(commandName));
    if (!command) {
      throw new Error(
        `❌ Comando não encontrado! Digite ${general.prefix}menu para ver todos os comandos disponíveis!`
      );
    }

    writeJSON(pathCache, [...cacheCommands, command.split('.')[0]]);

    return require(`./commands/${command}`).default;
  }

  return require(`./commands/${cacheCommand}`).default;
};

export const readJSON = (pathFile: string) => {
  // @ts-ignore
  return JSON.parse(fs.readFileSync(pathFile));
};

export const writeJSON = (pathFile: string, data: any) => {
  fs.writeFileSync(pathFile, JSON.stringify(data));
};



export const extractDataFromWebMessage = (message: proto.IWebMessageInfo) => {
  let remoteJid: string;
  let messageText: string | null | undefined;

  let isReply = false;

  let replyJid: string | null = null;
  let replyText: string | null = null;

  const {
    key: { remoteJid: jid, participant: tempUserJid },
  } = message;

  if (jid) {
    remoteJid = jid;
  }

  if (message) {
    const extendedTextMessage = message.message?.extendedTextMessage;
    const buttonTextMessage = message.message?.buttonsResponseMessage;
    const listTextMessage = message.message?.listResponseMessage;

    const type1 = message.message?.conversation;

    const type2 = extendedTextMessage?.text;

    const type3 = message.message?.imageMessage?.caption;

    const type4 = buttonTextMessage?.selectedButtonId;

    const type5 = listTextMessage?.singleSelectReply?.selectedRowId;

    const type6 = message?.message?.videoMessage?.caption;

    messageText = type1 || type2 || type3 || type4 || type5 || type6 || "";

    isReply =
      !!extendedTextMessage && !!extendedTextMessage.contextInfo?.quotedMessage;

    replyJid =
      extendedTextMessage && extendedTextMessage.contextInfo?.participant
        ? extendedTextMessage.contextInfo.participant
        : null;

    replyText = extendedTextMessage?.contextInfo?.quotedMessage?.conversation;
  }

  const userJid = tempUserJid?.replace(/:[0-9][0-9]|:[0-9]/g, "");

  const tempMessage = message?.message;

  const isImage =
    !!tempMessage?.imageMessage ||
    !!tempMessage?.extendedTextMessage?.contextInfo?.quotedMessage
      ?.imageMessage;

  const isVideo =
    !!tempMessage?.videoMessage ||
    !!tempMessage?.extendedTextMessage?.contextInfo?.quotedMessage
      ?.videoMessage;

  const isAudio =
    !!tempMessage?.audioMessage ||
    !!tempMessage?.extendedTextMessage?.contextInfo?.quotedMessage
      ?.audioMessage;

  const isSticker =
    !!tempMessage?.stickerMessage ||
    !!tempMessage?.extendedTextMessage?.contextInfo?.quotedMessage
      ?.stickerMessage;

  const isDocument =
    !!tempMessage?.documentMessage ||
    !!tempMessage?.extendedTextMessage?.contextInfo?.quotedMessage
      ?.documentMessage;

  let mentionedJid = "";

  let mentionedJidObject =
    tempMessage?.extendedTextMessage?.contextInfo?.mentionedJid;

  if (mentionedJidObject) {
    mentionedJid = mentionedJidObject[0];
  }

  return {
    userJid,
    remoteJid,
    messageText,
    isReply,
    replyJid,
    replyText,
    isAudio,
    isImage,
    isSticker,
    isVideo,
    isDocument,
    mentionedJid,
    webMessage: message,
  };
};

export const extractCommandAndArgs = (message: string) => {
  if (!message) return { command: "", args: "" };

  const [command, ...tempArgs] = message.trim().split(" ");

  const args = tempArgs.reduce((acc, arg) => acc + " " + arg, "").trim();

  return { command, args };
};

export const isCommand = (message: string) =>
  message.length > 1 && message.startsWith(general.prefix);

export const getRandomName = (extension?: string) => {
  const fileName = Math.floor(Math.random() * 10000);

  if (!extension) return fileName.toString();

  return `${fileName}.${extension}`;
};

export const downloadImage = async (
  webMessage: proto.IWebMessageInfo,
  fileName: string,
  folder: string | null = null,
  ...subFolders: string[]
) => {
  const content = (webMessage?.message?.imageMessage ||
    webMessage?.message?.extendedTextMessage?.contextInfo?.quotedMessage
      ?.imageMessage) as DownloadableMessage;

  if (!content) return null;

  const stream = await downloadContentFromMessage(content, "image");

  let buffer = Buffer.from([]);

  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }

  let directory = [__dirname, "..", "assets"];

  if (!folder) {
    directory = [...directory, "temp"];
  }

  if (folder) {
    directory = [...directory, folder];
  }

  if (subFolders.length) {
    directory = [...directory, ...subFolders];
  }

  const filePath = path.resolve(...directory, `${fileName}.jpg`);

  await writeFile(filePath, buffer);

  return filePath;
};

export const downloadVideo = async (
  webMessage: proto.IWebMessageInfo,
  fileName: string,
  folder: string | null = null,
  ...subFolders: string[]
) => {
  const content = (webMessage?.message?.videoMessage ||
    webMessage?.message?.extendedTextMessage?.contextInfo?.quotedMessage
      ?.videoMessage) as DownloadableMessage;

  if (!content) return null;

  const stream = await downloadContentFromMessage(content, "video");

  let buffer = Buffer.from([]);

  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }

  let directory = [__dirname, "..", "assets"];

  if (!folder) {
    directory = [...directory, "temp"];
  }

  if (folder) {
    directory = [...directory, folder];
  }

  if (subFolders.length) {
    directory = [...directory, ...subFolders];
  }

  const filePath = path.resolve(...directory, `${fileName}.mp4`);

  await writeFile(filePath, buffer);

  return filePath;
};

export const downloadSticker = async (
  webMessage: proto.IWebMessageInfo,
  fileName: string,
  folder: string | null = null,
  ...subFolders: string[]
) => {
  const content = (webMessage?.message?.stickerMessage ||
    webMessage?.message?.extendedTextMessage?.contextInfo?.quotedMessage
      ?.stickerMessage) as DownloadableMessage;

  if (!content) return null;

  const stream = await downloadContentFromMessage(content, "sticker");

  let buffer = Buffer.from([]);

  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk]);
  }

  let directory = [__dirname, "..", "assets"];

  if (!folder) {
    directory = [...directory, "temp"];
  }

  if (folder) {
    directory = [...directory, folder];
  }

  if (subFolders.length) {
    directory = [...directory, ...subFolders];
  }

  const filePath = path.resolve(...directory, `${fileName}.webp`);

  await writeFile(filePath, buffer);

  return filePath;
};

export const isSuperAdmin = async (botData: IBotData) => {
  return await validate("superadmin", botData);
};

export const isAdmin = async (botData: IBotData) => {
  return (
    (await validate("admin", botData)) ||
    (await validate("superadmin", botData))
  );
};

export const validate = async (
  type: string,
  { remoteJid, socket, userJid }: IBotData
) => {
  if (!isJidGroup(remoteJid)) return true;

  const { participants } = await socket.groupMetadata(remoteJid);

  const participant = participants.find(
    (participant: GroupParticipant) => participant.id === userJid
  );

  return participant && participant.admin === type;
};

export const onlyNumbers = (text: string) => {
  return text.replace(/[^0-9]/g, "");
};