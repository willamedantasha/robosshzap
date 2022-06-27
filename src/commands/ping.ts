import { IBotData } from "../Interface/IBotData";

export default async ({reply, user}: IBotData) => {
    await reply('Pong');
};