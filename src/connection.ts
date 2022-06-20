import makeWASocket, { DisconnectReason, fetchLatestBaileysVersion, useSingleFileAuthState } from "@adiwajshing/baileys";
import { Boom } from "@hapi/boom";
import path from 'path'
const P = require('pino')

export const connect = async () => {
    const { version } = await fetchLatestBaileysVersion()
    const {saveState, state} = useSingleFileAuthState(
        path.resolve(__dirname, '..', 'cache', 'auth_info.json')
    );

    const socket = makeWASocket({
        auth: state,
        logger: P({Level: 'error'}),
        printQRInTerminal: true,
        version,
        browser: ['ROBOSSH', '', '1.0'],
        async getMessage(key) {
            return { conversation: 'ROBOSSH' };
         },

    });

    socket.ev.on('connection.update', async(update) =>{
        const {connection, lastDisconnect} = update;
        if(connection === "close"){
            const shoudReconnection = (lastDisconnect?.error as Boom)?.output?.statusCode !== 
            DisconnectReason.loggedOut;

            if(shoudReconnection){
                await connect();
            }
        }
    });

    socket.ev.on('creds.update', saveState);

    return socket;

};