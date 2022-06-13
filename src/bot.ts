import { clearEmotionAndEspace, getBotData, getCommand, isCommand, readJSON } from "./function";
import { general } from "./configuration/general";
import { connect } from "./connection";
import router from './routes/index';
import { User } from "./entity/user";
import express from 'express';
import morgan from 'morgan';
import path from "path";
import { criarUser, updateUser } from "./controllers/userController";
import { delay } from "@adiwajshing/baileys";
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

        let user = readJSON(pathUsers).find(value => value.remoteJid === data.remoteJid)

        if (!user) {
            let newUser = new User();
            newUser.dataCriacao = new Date().toLocaleString();
            newUser.remoteJid = data.remoteJid;
            newUser.conversation = true;
            newUser.nome = clearEmotionAndEspace(webMessage.pushName);
            newUser.question = 'name';
            await criarUser(newUser);
            await data.sendText(false, 'Olá, seja bem vindo à *LuccasNet*.\n \nMeu nome é *LuccasBot* sou um assistente virtual, nesse primeiro momento siga as instruções para pesornalizar seu atendimento.')
            await socket.presenceSubscribe(webMessage.key.remoteJid)
            await delay(1000)
            await socket.sendPresenceUpdate('composing', webMessage.key.remoteJid)
            await delay(2000)
            await socket.sendPresenceUpdate('paused', webMessage.key.remoteJid)
            await data.sendButton(`Posso lhe chamar por *${newUser.nome}*?`, 'Sim', 'Não');
        } else if (user.conversation && !webMessage.key.fromMe) {
            let buttonId;
            try {
                buttonId = webMessage.message.buttonsResponseMessage.selectedButtonId;
            } catch (error) {
                console.log('button invalido!')
                buttonId = null;
            }

            if (user.question === 'name' && buttonId === 'id1') {
                if (user.nome.length > 5) {
                    user.question = 'operadora';
                    await updateUser(user);
                    await socket.presenceSubscribe(user.remoteJid)
                    await delay(1000)
                    await socket.sendPresenceUpdate('composing', user.remoteJid)
                    await delay(2000)
                    await socket.sendPresenceUpdate('paused', user.remoteJid)
                    return await data.sendButton(`${user.nome} qual sua operadora?`, 'Vivo ou Tim', 'Oi ou Claro')
                } else {
                    await socket.presenceSubscribe(user.remoteJid)
                    await delay(1000)
                    await socket.sendPresenceUpdate('composing', user.remoteJid)
                    await delay(1000)
                    await socket.sendPresenceUpdate('paused', user.remoteJid)
                    await data.sendText(true, '❌ Seu nome não é válido.')
                }
            } else if (user.question === 'name' && buttonId) {
                user.question = 'newName';
                await updateUser(user);
                await socket.presenceSubscribe(user.remoteJid)
                await delay(1000)
                await socket.sendPresenceUpdate('composing', user.remoteJid)
                await delay(1000)
                await socket.sendPresenceUpdate('paused', user.remoteJid)
                return await data.sendText(true, 'Como posso lhe chamar?');
            } else if (user.question === 'newName') {
                user.nome = clearEmotionAndEspace(webMessage.message.conversation);
                user.question = 'name';
                await updateUser(user);
                await socket.presenceSubscribe(user.remoteJid)
                await delay(1000)
                await socket.sendPresenceUpdate('composing', user.remoteJid)
                await delay(2000)
                await socket.sendPresenceUpdate('paused', user.remoteJid)
                return await data.sendButton(`Posso lhe chamar por *${user.nome}*?`, 'Sim', 'Não');
            } else if (user.question === 'name' && !buttonId) {
                await socket.presenceSubscribe(user.remoteJid)
                await delay(1000)
                await socket.sendPresenceUpdate('composing', user.remoteJid)
                await delay(1000)
                await socket.sendPresenceUpdate('paused', user.remoteJid)
                await data.sendText(true, 'Por favor aperte no botão acima para continuar seu atendimento.');
            }

            if (user.question === 'operadora') {
                let buttonId;
                try {
                    buttonId = webMessage.message.buttonsResponseMessage.selectedButtonId;
                } catch (error) {
                    buttonId = null;
                }

                if (buttonId === 'id1') {
                    user.operadora = 'Vivo ou Tim';
                    user.question = 'info';
                    await updateUser(user)
                    await socket.presenceSubscribe(user.remoteJid)
                    await delay(1000)
                    await socket.sendPresenceUpdate('composing', user.remoteJid)
                    await delay(2000)
                    await socket.sendPresenceUpdate('paused', user.remoteJid)
                    await data.reply('😍 Ótimo essas são as melhores operadora para ter nossa internet móvel!');
                    await socket.presenceSubscribe(user.remoteJid)
                    await delay(1000)
                    await socket.sendPresenceUpdate('composing', user.remoteJid)
                    await delay(2000)
                    await socket.sendPresenceUpdate('paused', user.remoteJid)
                    await data.sendText(false, `${user.nome} recomendamos ter dois chip em seu smartphone para garantir um melhor serviço.`);
                } else if (buttonId === 'id2') {
                    user.operadora = 'Oi e Claro';
                    user.question = 'info';
                    await socket.presenceSubscribe(user.remoteJid)
                    await delay(1000)
                    await socket.sendPresenceUpdate('composing', user.remoteJid)
                    await delay(2000)
                    await socket.sendPresenceUpdate('paused', user.remoteJid)
                    await data.reply('😐 Essas operadoras não são as melhores, mais não desanime faça um teste!');
                    await socket.presenceSubscribe(user.remoteJid)
                    await delay(1000)
                    await socket.sendPresenceUpdate('composing', user.remoteJid)
                    await delay(2000)
                    await socket.sendPresenceUpdate('paused', user.remoteJid)
                    await data.sendText(false, `${user.nome} recomendamos ter dois chip em seu smartphone para garantir um melhor serviço.`);
                } else {
                    await socket.presenceSubscribe(user.remoteJid)
                    await delay(1000)
                    await socket.sendPresenceUpdate('composing', user.remoteJid)
                    await delay(2000)
                    await socket.sendPresenceUpdate('paused', user.remoteJid)
                    await data.sendText(true, 'Escolha uma opção para avançar.')
                    await socket.presenceSubscribe(user.remoteJid)
                    await delay(1000)
                    await socket.sendPresenceUpdate('composing', user.remoteJid)
                    await delay(1000)
                    await socket.sendPresenceUpdate('paused', user.remoteJid)
                    await data.sendButton(`${user.nome} qual sua operadora?`, 'Vivo ou Tim', 'Oi ou Claro')
                }

            }

            if (user.question === 'info') {
                user.conversation = false;
                await updateUser(user);
                await socket.presenceSubscribe(user.remoteJid)
                await delay(5000)
                await socket.sendPresenceUpdate('composing', user.remoteJid)
                await delay(5000)
                await socket.sendPresenceUpdate('paused', user.remoteJid)
                await data.sendText(true, `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n               🔰 *Informações* 🔰 \n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n \n✅Nossa internet funciona por aplicativo, é ilimitada *dura o mês todo*.\n✅Vc precisa ter um smartphone android ( _não funciona em iphone_ )\n✅Precisa instalar nosso aplicativo em seu smartphone\n✅Não fazemos devolução de pagamento, faça seu teste antes.`);
                await socket.presenceSubscribe(user.remoteJid)
                await delay(10000)
                await socket.sendPresenceUpdate('composing', user.remoteJid)
                await delay(8000)
                await socket.sendPresenceUpdate('paused', user.remoteJid)
                await data.sendMenu(user.nome);
            }

            console.log('Resposta: ' + JSON.stringify(webMessage))

        }

        if (!isCommand(command)) return;

        try {
            const action = await getCommand(command.replace(general.prefix, ""));
            await action({ command, ...data });
        } catch (error) {
            console.log('Log_bot_ts: ' + error);
        }
    });
};