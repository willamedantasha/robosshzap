import { isCriarTeste } from "../function";
import { IBotData } from "../Interface/IBotData";
import { buscarUser, criarUser, updateUser } from "../controllers/userController";
import { Acesso, User } from "../entity/user";
const { Client } = require('ssh2');

export default async ({ sendText, sendApk, reply, remoteJid }: IBotData) => {
    let user = buscarUser(remoteJid)
    if (user) {
        if (isCriarTeste(user.dataTeste) || user.acesso === Acesso.revenda) {
            user.dataTeste = new Date().toLocaleString();
            let enviarApk = user.acesso === Acesso.usuario ? true : false;
            await updateUser(user)
            await criarLogin(reply, sendText, sendApk, enviarApk)
        } else {
            await reply('❌ Não foi possível criar seu teste.\nLogo um atendente irar lhe ajudar!');
        }
    } else {
        await reply('❌ Não foi possível criar seu teste, você não possui cadastro.');
    }
};

const criarLogin = async (reply: any, sendText: any, sendApk: any, enviarApk: boolean) => {
    var conn = new Client();
    conn.on('ready', function () {
        conn.exec('./teste.sh', function (err, stream) {
            if (err) throw err;
            stream.on('close', function (code, signal) {
                conn.end();
            }).on('data', function (data) {
                sendText(true, data);
                if (enviarApk) {
                    sendText(false, 'Aplicativo\nhttps://play.google.com/store/apps/details?id=com.netstar.movel');
                    sendApk();
                }
            }).stderr.on('data', function (data) {
                reply('❌Erro ao gerar seu teste, contate o administrador.')
            });
        });
    }).connect({
        host: process.env.SSH_IPSERVER,
        port: 22,
        username: process.env.SSH_USER,
        password: process.env.SSH_PASSWORD
    });
}
