import { readJSON } from "../function";
import { IBotData } from "../Interface/IBotData";
import { StringsMsg } from "../util/stringsMsg";
import { StringClean } from "../util/stringClean";
import path from "path";
const { Client } = require('ssh2');

export default async ({ args, remoteJid, reply, owner }: IBotData) => {
    const pathUsers = path.join(__dirname, "..", "..", "cache", "user.json");
    let user = readJSON(pathUsers).find(value => value.remoteJid === remoteJid)
    let login = user.login
    if (user) {
        if (args && owner) {
            if (args.length < 8) {
                return await reply(StringsMsg.errorLoginSize);
            }
            login = StringClean(args);
        }
        infoUser(reply,login);
    } else {
        reply(StringsMsg.errorUser);
    }
}

const infoUser = (reply: any, login: string) => {
    var conn = new Client();
    conn.on('ready', function () {
        conn.exec(`./infoUser.sh ${login}`, function (err, stream) {
            if (err) throw err;
            stream.on('close', function (code, signal) {
                conn.end();
            }).on('data', function (data) {
                reply(data)
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