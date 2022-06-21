import { IBotData } from "../Interface/IBotData";

export default async ({reply, sendApk, remoteJid, args}: IBotData) => {
    await reply('Pong');
};