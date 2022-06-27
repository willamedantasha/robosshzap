import { IBotData } from "../Interface/IBotData";
import { StringsMsg } from "../util/stringsMsg";

export default async ({reply, user}: IBotData) => {
    await reply('Pong');
    await reply(StringsMsg.errorSaldo);
};