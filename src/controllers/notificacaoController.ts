import { readJSON, writeJSON } from "../function";
import path from "path";
import { Pagamento } from "../entity/pagamento";

const P = require('pino')

export const notificacaopix = async (req, res) => {
    const dados = req.query;

    if (!dados.hasOwnProperty('data.id') && !dados.hasOwnProperty('type')) {
        console.log('Erro no envio dos parametros da notificação!')
        return res.status(400)
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
            return res.status(400)
        }
    } else {
        return res.status(400)
    }

    //verifica se o pagamento está aprovado
    if (payment_info.status === 200 && payment_info.response.status !== 'pending') {
        let details = payment_info.response.transaction_details.transaction_id;

        if (details && payment_info.response.status === 'approved') {
            criarPagamento(payment_info);
        } else {
            console.log('Não pode criar login, estou dentro do notifica controller.')
        }
    }

    return res.status(200)
}

const criarPagamento = (payment_info: any) => {

    const pathJson = path.join(__dirname, "..", "..", "cache", "pagamentos.json");
    let arquivo = readJSON(pathJson)
    let id = payment_info.response.id;

    let isCriarPgto = arquivo.find(value => value.idPgto === id);


    if (!isCriarPgto) {
        const pagamento = new Pagamento();
        pagamento.remoteJid = payment_info.response.external_reference.trim();
        pagamento.idPgto = id;
        pagamento.data = new Date().toLocaleString();

        arquivo.push(pagamento)
        writeJSON(pathJson, arquivo);
    }

}

