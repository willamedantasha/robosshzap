export class User {
    idPgto : number[];
    remoteJid : string;
    dataCriacao: string;
    dataTeste: string;
    dataPix: string;
    conversation: boolean;
    question: Question;
    nome: string;
    operadora: string;
    login: string;
    acesso: Acesso;
}

export enum Question {
    Name,
    NewName,
    Operadora,
    Info
}

export enum Acesso {
    revenda,
    usuario
}