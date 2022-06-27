import { IBotData } from "../Interface/IBotData";
import { readJSON } from "../function";
import path from "path";
import { Acesso } from "../entity/user";
import { updateUser } from "../controllers/userController";
import { StringsMsg } from "../util/stringsMsg";

export default async ({webMessage, remoteJid, reply, owner}: IBotData) => {
    if(owner){
        const pathUsers = path.join(__dirname, "..", "..", "cache", "user.json");
        let user = readJSON(pathUsers).find(value => value.remoteJid === remoteJid)
        if(user){
            if(user.acesso === Acesso.usuario){
                user.acesso = Acesso.revenda;
                await updateUser(user);
                await reply("✅ Acesso de revendedor liberado!");
            } else {
                user.acesso = Acesso.usuario;
                await updateUser(user);
                await reply("❎ Acesso de revendedor removido!");
            }
        } else {
            reply(StringsMsg.errorUser)
        }
    } else {
        reply(StringsMsg.acessoNegado);
    }
};