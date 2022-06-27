import { Boom } from '@hapi/boom'
import makeWASocket, { DisconnectReason, fetchLatestBaileysVersion, makeInMemoryStore, MessageRetryMap, useMultiFileAuthState } from '@adiwajshing/baileys'
import MAIN_LOGGER from './util/logger'
import path from 'path'

const logger = MAIN_LOGGER.child({ })
logger.level = 'trace'

const useStore = !process.argv.includes('--no-store')
const doReplies = !process.argv.includes('--no-reply')

// external map to store retry counts of messages when decryption/encryption fails
// keep this out of the socket itself, so as to prevent a message decryption/encryption loop across socket restarts
const msgRetryCounterMap: MessageRetryMap = { }


// start a connection
export const startSock = async() => {
	const { state, saveCreds } = await useMultiFileAuthState(
        path.resolve(__dirname, '..', 'cache', 'auth_info.json')
    )
	// fetch latest version of WA Web
	const { version, isLatest } = await fetchLatestBaileysVersion()
	//console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)

	const sock = makeWASocket({
		version,
		logger,
		printQRInTerminal: true,
		auth: state,
		msgRetryCounterMap,
		// implement to handle retries
		getMessage: async key => {
			return {
				conversation: 'hello'
			}
		}
	})

	sock.ev.on('connection.update', (update) => {
		const { connection, lastDisconnect } = update
		if(connection === 'close') {
			// reconnect if not logged out
			if((lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut) {
                sock.sendMessageAck
				startSock()
			} else {
				console.log('Connection closed. You are logged out.')
			}
		}
		console.log('connection update', update)
	})
	// listen for when the auth credentials is updated
	sock.ev.on('creds.update', saveCreds)
	return sock
}