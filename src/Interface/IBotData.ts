import { proto } from '@adiwajshing/baileys'

export interface IBotData {
    sendMenu: (nome: string) => Promise<proto.WebMessageInfo>;
    sendButton: (mensagem: string, textBtn1: string, textBtn2: string, textBtn3?: string) => Promise<proto.WebMessageInfo>;
    sendText: (ass: boolean, text: string) => Promise<proto.WebMessageInfo>;
    sendImage: (pathOrBuffer: string | Buffer, caption?: string, isReply?: boolean) => Promise<proto.WebMessageInfo>;
    sendSticker: (pathOrBuffer: string | Buffer, isReply?: boolean) => Promise<proto.WebMessageInfo>;
    sendAudio: (pathOrBuffer: string | Buffer, isReply?: boolean, ptt?: boolean) => Promise<proto.WebMessageInfo>;
    reply: (text: string) => Promise<proto.WebMessageInfo>;
    socket: any;
    remoteJid: string;
    replyJid: string;
    webMessage: proto.IWebMessageInfo;
    isImage: boolean;
    isSticker: boolean;
    isAudio: boolean;
    isVideo: boolean;
    isDocument: boolean;
    command: string;
    args: string;
    userJid: string;
    messageText: string;


}