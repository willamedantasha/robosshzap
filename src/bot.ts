import { clearEmotionAndEspace, getBotData, getCommand, isCommand, readJSON } from "./function";
import { general } from "./configuration/general";
import { connect } from "./connection";
import router from './routes/index';
import express from 'express';
import morgan from 'morgan';
import path from "path";
import { conversation } from "./conversation";
const pathUsers = path.join(__dirname, "..", "cache", "user.json");

export default async () => {

    const socket = await connect();

    const app = express();
    app.use(morgan('dev'));
    app.use(router)
    app.listen(3000);

    console.log('Server: ', 3000);

    socket.ev.on('messages.upsert', async (message) => {
        var [webMessage] = message.messages;

        //ignorar mensagens de brodcast
        if (webMessage.key.remoteJid === "status@broadcast") {
            return;
        }

        const { command, ...data } = getBotData(socket, webMessage);

        if(!webMessage.key.fromMe){
            let user = readJSON(pathUsers).find(value => value.remoteJid === data.remoteJid)
            conversation(user,data);            
        }

        if (!isCommand(command)) return;

        try {
            const action = await getCommand(command.replace(general.prefix, ""));
            await action({ command, ...data });
        } catch (error) {
            console.log('Log_bot: ' + error);
        }
    });
};