import { IBotData } from "../Interface/IBotData";
import path from "path";
import { readJSON } from "../function";

export default async ({ sendMenu, remoteJid }: IBotData) => {
    const pathUsers = path.join(__dirname, "..", "..", "cache", "user.json");
    let user = readJSON(pathUsers).find(value => value.remoteJid === remoteJid)
    if (user) {
        sendMenu(user.nome)
    }
}