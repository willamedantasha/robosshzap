import { isCriarTeste } from "../function";
import { IBotData } from "../Interface/IBotData";
import { buscarUser, criarUser, updateUser } from "../controllers/userController";
import { User } from "../entity/user";
const { Client } = require('ssh2');

export default async ({ sendText, reply, remoteJid }: IBotData) => {

    let user = buscarUser(remoteJid)
    if (user) {
        if (isCriarTeste(user.dataTeste) || user.isAdmin) {
            user.dataTeste = new Date().toLocaleString();
            await updateUser(user)
            await criarLogin(reply, sendText)
        } else {
            await reply('❌ Não foi possivel criar seu teste. \nSó pode criar 1 teste a cada 24h.');
        }
    } else {
        let newUser = new User();
        newUser.remoteJid = remoteJid;
        newUser.dataCriacao = new Date().toLocaleString();
        newUser.dataTeste = new Date().toLocaleString();
        await criarUser(newUser)
        await criarLogin(reply, sendText)
    }
};

const criarLogin = async (reply: any, sendText: any) => {
    var conn = new Client();
    conn.on('ready', function () {
        conn.exec('./teste.sh', function (err, stream) {
            if (err) throw err;
            stream.on('close', function (code, signal) {
                conn.end();
            }).on('data', function (data) {
                sendText(true,data);
                sendText(false,'Aplicativo\nhttps://play.google.com/store/apps/details?id=com.netstar.movel');
            }).stderr.on('data', function (data) {
                reply('❌Erro ao gerar seu teste, contate o administrador.')
            });
        });
    }).connect({
        host: '152.67.60.210',
        port: 22,
        username: 'root',
        password: '@d3s2a1'
    });
}
