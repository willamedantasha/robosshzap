import { User } from "../entity/user";
import { IBotData } from "../Interface/IBotData";
import path from "path";
import { readJSON } from "../function";
import { StringsMsg } from "../util/stringsMsg";
import { updateUser } from "../controllers/userController";
import { StringClean } from "../util/stringClean";

const { Client } = require('ssh2');
const pathUsers = path.join(__dirname, "..", "..", "cache", "user.json");

export default async ({ sendText, reply, remoteJid, args }: IBotData) => {
    let user: User = readJSON(pathUsers).find(value => value.remoteJid === remoteJid)
    if (user) {
        let credito: number = user.credito ? user.credito : 0;
        if (credito <= 0) {
            reply(StringsMsg.errorSaldo)
            return
        }
        if (args) {
            if (args.length < 8) {
                return await reply(StringsMsg.errorLoginSize);
            }
            user.login = StringClean(args);
        }
        updateLogin(reply, sendText, user);
    } else {
        await reply(StringsMsg.errorUser);
    }
};

const updateLogin = (reply: any, sendText: any, user: User) => {
    var conn = new Client();
    conn.on('ready', function () {
        conn.exec(`./updateUser.sh ${user.login}`, function (err, stream) {
            if (err) throw err;
            stream.on('close', function (code, signal) {
                conn.end();
            }).on('data', function (data) {
                let res = data.toString();
                if (res.includes('Erro')) {
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

    if (process.env.SSH_BACKUP) {
        var conn_bkp = new Client();
        conn_bkp.on('ready', function () {
            conn_bkp.exec(`./updateUser.sh ${user.login}`, function (err, stream) {
                if (err) throw err;
                stream.on('close', function (code, signal) {
                    conn_bkp.end();
                }).on('data', function (data) {
                    let res = data.toString();
                    if (res.includes('Erro')) {
                        console.log(res)
                        return
                    }
                    console.log(data)
                }).stderr.on('data', function (data) {
                    console.error('Criar login backup: '+data.toString())
                });
            });
        }).connect({
            host: process.env.SSH_BACKUP_HOST,
            port: 22,
            username: process.env.SSH_BACKUP_USER,
            password: process.env.SSH_BACKUP_PASSWORD
        });
    }
}