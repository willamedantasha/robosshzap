export class User {
    nome: string;
    login: string;
    senha: string;
    remoteJid : string;
    operadora: string;
    dataCriacao: string;
    dataTeste: string;
    dataPix: string;
    idPgto : number[];
    conversation: boolean;
    question: Question;
    acesso: Acesso;
    credito: number;
}

export enum Question {
    Name = 'nome',
    NewName = 'novoNome',
    Operadora = 'operadora',
    Info = 'info'
}

export enum Acesso {
    revenda = 'revenda',
    usuario = 'usuario'
}