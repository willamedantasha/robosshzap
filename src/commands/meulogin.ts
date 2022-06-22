import { buscarUser, updateUser } from "../controllers/userController";
import { writeJSON } from "../util/jsonConverte";
import { IBotData } from "../Interface/IBotData";
import { readJSON } from "../function";
import { User } from "../entity/user";
import path from "path";

const { Client } = require('ssh2');
const pathUsers = path.join(__dirname, "..", "..", "cache", "user.json");
const pathPagamentos = path.join(__dirname, "..", "..", "cache", "pagamentos.json");

export default async ({ sendText, reply, remoteJid, args }: IBotData) => {

    let login: string;
    let user = readJSON(pathUsers).find(value => value.remoteJid === remoteJid)

    if (user) {
        
        login = user.nome.replace(/\s/g, '').toLowerCase();
        if (args) {
            if (args.length < 8) {
                return await reply("▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n      ❌ Erro ao criar seu login ❌\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n \nEnvie a mensagem conforme o exemplo.\nex.: _#menu nomesobrenome_");
            }
            login = args.replace(/\s/g, '').toLowerCase();
        }

        let pagamentos = readJSON(pathPagamentos)
        let pagamento = pagamentos.find(value => value.remoteJid === remoteJid);

        if (pagamento) {
            let user: User = buscarUser(remoteJid);
            let isUserCriar = user.idPgto?.includes(pagamento.idPgto)
            
            //setar valor padrao para a variavel.
            if(isUserCriar === undefined){
                isUserCriar = false
                user.idPgto = []
            }

            if (!isUserCriar) {
                user.idPgto.push(pagamento.idPgto);
                user.login = login;
                await removerPagamento(remoteJid);
                return await criarLogin(reply, sendText, user);

            } else {
                await removerPagamento(remoteJid);
                await reply(user.login)
            }

        } else {
            await reply('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n❌Pagamento Não Encontrado❌\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n\nSolicite seu pagamento digitando *#pix*, depois de pago solicite seu login.')
        }
    }
};

const criarLogin = async (reply: any, sendText: any, user: User) => {
    var conn = new Client();
    conn.on('ready', function () {
        conn.exec(`./criarusuariopremium.sh ${user.login}`, function (err, stream) {
            if (err) throw err;
            stream.on('close', function (code, signal) {
                conn.end();
            }).on('data', function (data) {
                user.login = data.toString();
                updateUser(user)
                sendText(true, data)
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

const removerPagamento = async (remoteJid: string) => {
    const pagamentos = readJSON(pathPagamentos)
    await pagamentos.splice(pagamentos.findIndex(value => value.remoJid === remoteJid), 1);
    await writeJSON(pathPagamentos, pagamentos);
}
