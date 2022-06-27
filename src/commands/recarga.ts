import { IBotData } from "../Interface/IBotData";
import { StringsMsg } from "../util/stringsMsg";
import path from "path";
import { readJSON } from "../function";
import { updateUser } from "../controllers/userController";

export default async ({ owner, remoteJid, args, reply }: IBotData) => {    
    if (owner) {
        const pathUsers = path.join(__dirname, "..", "..", "cache", "user.json");
        let user = readJSON(pathUsers).find(value => value.remoteJid === remoteJid)
        if (!user) {
            reply(StringsMsg.errorUser)
            return
        }
        if(!args){
            reply(StringsMsg.errorArgs)
            return
        }
        let credito: number = parseInt(args);
        if(!credito){
            reply(StringsMsg.errorArgs)
            return
        }
        user.credito += credito;
        await updateUser(user)  
        await reply(StringsMsg.recarga + user.credito)      
    } else {
        reply(StringsMsg.acessoNegado);
    }
};