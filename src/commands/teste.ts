import { isCriarTeste } from "../function";
import { IBotData } from "../Interface/IBotData";
import { buscarUser, criarUser, updateUser } from "../controllers/userController";
import { Acesso, User } from "../entity/user";
import { StringsMsg } from "../util/stringsMsg";
const { Client } = require('ssh2');

export default async ({ sendText, sendApk, reply, remoteJid, owner }: IBotData) => {
    let user = buscarUser(remoteJid)
    if (user) {
        if (isCriarTeste(user.dataTeste) || user.acesso === Acesso.revenda || owner) {
            user.dataTeste = new Date().toLocaleString();
            let enviarApk = user.acesso === Acesso.usuario ? true : false;
            await updateUser(user)
            
            criarLogin(reply, sendText, sendApk, enviarApk);
        } else {
            await reply(StringsMsg.errorLogin);
        }
    } else {
        await reply(StringsMsg.errorUser);
    }
};

export const criarLogin = async (reply: any, sendText: any, sendApk: any, enviarApk: boolean) => {
    var conn = new Client();
    var responser: string = ""; 
    conn.on('ready', function () {
        conn.exec('./createTest.sh', function (err, stream) {
            if (err) throw err;
            stream.on('close', function (code, signal) {
                conn.end();
            }).on('data', function (data) {                
                sendText(true, data);
                if (enviarApk) {
                    sendText(false, StringsMsg.aplicativo);
                    sendApk();
                }
            }).stderr.on('data', function (data) {
                reply(StringsMsg.errorLogin)
            });
        });
    }).connect({
        host: process.env.SSH_HOST,
        port: 22,
        username: process.env.SSH_USER,
        password: process.env.SSH_PASSWORD
    });
}