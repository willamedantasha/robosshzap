import { clearEmotionAndEspace, getBotData, getCommand, isCommand, readJSON } from "./function";
import { general } from "./configuration/general";
import { connect } from "./connection";
import path from "path";
import { conversation } from "./conversation";
import { criarUser } from "./controllers/userController";
import { Acesso, Question, User } from "./entity/user";
const pathUsers = path.join(__dirname, "..", "cache", "user.json");

export default async () => {
    const socket = await connect();
    socket.ev.on('messages.upsert', async (message) => {
        var [webMessage] = message.messages;
        //ignorar mensagens de brodcast
        if (webMessage.key.remoteJid === "status@broadcast") {
            return;
        }
        let user : User = readJSON(pathUsers).find(value => value.remoteJid === webMessage.key.remoteJid)
        const { command, ...data } = getBotData(socket, webMessage, user);
        if(!webMessage.key.fromMe){
            if (!user) {
                let newUser = new User();
                newUser.dataCriacao = new Date().toLocaleString();
                newUser.remoteJid = data.remoteJid;
                newUser.conversation = true;
                newUser.nome = clearEmotionAndEspace(data.webMessage.pushName);
                newUser.question = Question.Name;
                newUser.acesso = Acesso.usuario;
                newUser.credito = 0;
                await criarUser(newUser);
                await data.sendText(false, 'Olá, seja bem vindo à *LuccasNet*.\n \nMeu nome é *LuccasBot* sou um assistente virtual, nesse primeiro momento siga as instruções para pesornalizar seu atendimento.')
                await data.presenceTime(1000, 2000);
                await data.sendButton(`Posso lhe chamar por *${newUser.nome}*?`, 'Sim', 'Não');
            }else if(user?.conversation){
                conversation(user,data);            
            }
        }
        if (!isCommand(command)) return;

        if ((user && !user?.conversation) || webMessage.key.fromMe) {
            try {
                const action = await getCommand(command.replace(general.prefix, ""));
                await action({ command, ...data });
            } catch (error) {
                console.log('Log_bot: ' + error);
            }
        }
    });
};