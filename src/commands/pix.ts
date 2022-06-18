import { buscarUser, updateUser } from "../controllers/userController";
import { isCriarPix } from "../function";
import { IBotData } from "../Interface/IBotData";

export default async ({ remoteJid, reply, sendText }: IBotData) => {

    let user = buscarUser(remoteJid);

    if (user && isCriarPix(user.dataPix)) {
        var mercadopago = require('mercadopago');
        mercadopago.configurations.setAccessToken(process.env.MP_ACCESSTOKEN);

        var payment_data = {
            transaction_amount: 15,
            description: '1',
            payment_method_id: 'pix',
            external_reference: remoteJid,
            payer: {
                email: 'pagamento@internet.com',
                first_name: 'Producao',
                last_name: 'User',
                identification: {
                    type: 'CPF',
                    number: '19119119100'
                },
                address: {
                    zip_code: '06233200',
                    street_name: 'Av. das Nações Unidas',
                    street_number: '3003',
                    neighborhood: 'Bonfim',
                    city: 'Osasco',
                    federal_unit: 'SP'
                }
            },
            notification_url: process.env.NOTIFICATION_URL,
        };

        mercadopago.payment.create(payment_data).then(
            async function (data) {
                await reply('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n    ✅ Pix Criado com sucesso ✅\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n Copie a mensagem abaixo e use a opção de chave *Pix Cópia E Cola* para realizar o pagamento.');
                await sendText(false,data.body.point_of_interaction.transaction_data.qr_code);
                await sendText(true,'Depois que realizar o pagamento mande mensagem *#meulogin* para receber seu acesso.')
                user.dataPix = new Date().toLocaleString();
                await updateUser(user)
            }).catch(async function (error) {
                await reply('❌ Erro ao criar pagamento.\nEntre em contato no com o administrador.')
            });

    } else {
        await reply('▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n    ❌ Erro Ao Criar Pix ❌\n▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬\n \n Você não possui cadastro ou já criou um pix em menos de 24h.')
    }
};
