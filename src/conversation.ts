import { updateUser } from "./controllers/userController";
import { Question, User } from "./entity/user";
import { clearEmotionAndEspace } from "./function";

export const conversation = async (user: User, data: any) => {

    if (user.conversation) {
        let buttonId = data.webMessage.message?.buttonsResponseMessage?.selectedButtonId;
        switch (user.question) {
            case Question.Name:
                if (buttonId === 'id1') {
                    if (user.nome.length > 5) {
                        user.question = Question.Operadora;
                        await updateUser(user);
                        await data.presenceTime(1000, 2000);
                        return await data.sendButton(`${user.nome} qual sua operadora?`, 'Vivo ou Tim', 'Oi ou Claro')
                    } else {
                        user.question = Question.NewName;
                        await updateUser(user);
                        await data.presenceTime(1000, 1000);
                        await data.sendText(true, '❌ Seu nome não é válido, digite nome e sobrenome!')
                    }
                } else if (buttonId === 'id2') {
                    user.question = Question.NewName;
                    await updateUser(user);
                    await data.presenceTime(1000, 1000);
                    await data.sendText(true, 'Como posso lhe chamar?');
                } else {
                    await data.presenceTime(1000, 1000);
                    await data.sendText(true, 'Por favor selecione uma opção para continuar seu atendimento.');
                }
                break;
            case Question.NewName:
                user.nome = clearEmotionAndEspace(await data.webMessage.message.conversation);
                user.question = Question.Name;
                await updateUser(user);
                await data.presenceTime(1000, 1000);
                await data.sendButton(`Posso lhe chamar por *${user.nome}*?`, 'Sim', 'Não');
                break;
            case Question.Operadora:
                if (buttonId === 'id1') {
                    user.operadora = 'Vivo ou Tim';
                    user.question = Question.Info;
                    await updateUser(user)
                    await data.presenceTime(1000, 2000);
                    await data.reply('😍 Ótimo essas são as melhores operadora para ter nossa internet móvel!');
                    await data.presenceTime(1000, 2000);
                    await data.sendText(false, `${user.nome} recomendamos ter dois chip em seu smartphone para garantir um melhor serviço.`);
                } else if (buttonId === 'id2') {
                    user.operadora = 'Oi e Claro';
                    user.question = Question.Info;
                    await data.presenceTime(1000, 2000);
                    await data.reply('😐 Essas operadoras não são as melhores, mais não desanime faça um teste!');
                    await data.presenceTime(1000, 2000);
                    await data.sendText(false, `${user.nome} recomendamos ter dois chip em seu smartphone para garantir um melhor serviço.`);
                } else {
                    await data.presenceTime(1000, 2000);
                    await data.sendText(true, 'Por favor selecione uma opção para continuar seu atendimento.');
                }
                break;
            default:
                break
        }

        if (user.question === Question.Info) {
            user.conversation = false;
            await updateUser(user);
            await data.presenceTime(3000, 7000);
            await data.sendText(true, `▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n               🔰 *Informações* 🔰 \n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n \n✅Nossa internet funciona por aplicativo, é ilimitada *dura o mês todo*.\n✅Vc precisa ter um smartphone android ( _não funciona em iphone_ )\n✅Precisa instalar nosso aplicativo em seu smartphone\n✅Não fazemos devolução de pagamento, faça seu teste antes.`);
            await data.presenceTime(2000, 8000);
            await data.sendMenu(user.nome);
        }
    }
}