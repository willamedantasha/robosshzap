import { IBotData } from "../Interface/IBotData";

export default async ({reply, remoteJid, args}: IBotData) => {

    reply('Pong');
    console.log('remoteJid: '+remoteJid);
    console.log('args: '+ args);
};