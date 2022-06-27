import { readJSON, writeJSON } from "../function";
import path from "path";
import { updateUser } from "./userController";
import { User } from "../entity/user";

const P = require('pino')
const pathUsers = path.join(__dirname, "..", "..", "cache", "user.json");

export const notificacaopix = async (req, res) => {
    const dados = req.query;
    if (!dados.hasOwnProperty('data.id') && !dados.hasOwnProperty('type')) {
        console.log('Erro no envio dos parametros da notificação!')
        res.status(400);
        return;
    }
    let payment_info;
    //faz a consulta na api para verificar os pagamentos
    if (dados['type'] === 'payment') {
        try {
            var mercadopago = require('mercadopago');
            mercadopago.configurations.setAccessToken(process.env.MP_ACCESSTOKEN);
            payment_info = await mercadopago.payment.get(dados['data.id'])
        } catch (error) {
            console.log('Log: Erro ao consultar api do mercado pago!\n' + error);
            res.status(400);
            return;
        }
    } else {
        res.status(400);
        return;
    }
    //verifica se o pagamento está aprovado
    if (payment_info.status === 200 && payment_info.response.status !== 'pending') {
        let details = payment_info.response.transaction_details.transaction_id;

        if (details && payment_info.response.status === 'approved') {
            let remoteJid = payment_info.response.external_reference.trim();
            let user : User = readJSON(pathUsers).find(value => value.remoteJid === remoteJid)
            //verifica se este pagamento já foi concluido.
            let isPayment = user.idPgto?.includes(payment_info.response.id)
            if (isPayment === undefined) {
                isPayment = false;
                user.idPgto = [];
            }
            if (isPayment) {
                console.log('Pagamento já processado.')
                res.status(400);
                return;
            }

            let credito: number = 0;
            if (user?.credito) {
                credito = user.credito;
            }
            credito += 1
            user.idPgto.push(payment_info.response.id); 
            user.credito = credito;
            updateUser(user)
        } else {
            console.log('Não pode criar login.')
        }
    }
    res.status(400);
    return;
}

