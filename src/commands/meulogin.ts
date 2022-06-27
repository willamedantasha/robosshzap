import { updateUser } from "../controllers/userController";
import { writeJSON } from "../util/jsonConverte";
import { IBotData } from "../Interface/IBotData";
import { readJSON } from "../function";
import { User } from "../entity/user";
import path from "path";
import { StringsMsg } from "../util/stringsMsg";

const { Client } = require('ssh2');
const pathUsers = path.join(__dirname, "..", "..", "cache", "user.json");

export default async ({ sendText, reply, remoteJid, args }: IBotData) => {
    let user: User = readJSON(pathUsers).find(value => value.remoteJid === remoteJid)
    if (user) {
        let credito : number = user.credito ? user.credito : 0;
        if(credito <= 0) {
            reply(StringsMsg.errorSaldo)
            return
        }
        user.login = user.nome.replace(/\s/g, '').toLowerCase();
        if (args) {
            if (args.length < 8) {
                return await reply(StringsMsg.errorLoginSize);
            }
            user.login = args.replace(/\s/g, '').toLowerCase();
        }
        criarLogin(reply, sendText, user);
    } else {
        await reply(StringsMsg.errorUser);
    }
};

const criarLogin = (reply: any, sendText: any, user: User) => {
    var conn = new Client();
    conn.on('ready', function () {
        conn.exec(`./createUser.sh ${user.login}`, function (err, stream) {
            if (err) throw err;
            stream.on('close', function (code, signal) {
                conn.end();
            }).on('data', function (data) {
                let res = data.toString();
                if(res.includes('Erro')){
                    reply(res)
                    return
                }
                user.credito -= 1
                updateUser(user)
                sendText(true, data)
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
