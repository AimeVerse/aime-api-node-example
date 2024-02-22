import 'dotenv/config'
import { _x, Wormholes, _xem, WormholeEvents, _xlog } from "xpell-node"

import {AimeApi} from "./aime/api.js"


async function main() {


    _x.verbose() // enable verbose mode
    _x.start() // start the xpell engine


    // event listeners for wormhole open (connection established)
    _xem.on(WormholeEvents.WormholeOpen, async (data: any) => {
        const serverAuth = {
            _module: "server-manager",
            _op: "auth-server",
            _params: {
                _t: wormholeToken
            }
        }

        // send the server auth command
        try {
            const resA = await Wormholes.sendSync(serverAuth, true)
            start()
        } catch (error) {
            _xlog.log("Wormhole Error", error)
        }
    })

    const wormholeToken = process.env.AIME_SERVER_TOKEN
    const wormholeUrl = process.env.AIME_SERVER_URL
    if(!wormholeToken || !wormholeUrl){
        throw new Error("Wormhole token or url not found")
    } else {
        Wormholes.open(<any>wormholeUrl)
    }
}

async function start() {

    // get the environment name from the server - example of a simple command
    const envNameResponse = await Wormholes.sendSync(AimeApi.getEnvironmentName(), true)
    console.log("Environment Name is " + envNameResponse)

    


    //get space id from environment variables
    const spaceId = process.env.AIME_SPACE_ID

    if(!spaceId) throw new Error("Space ID not found")
    

    //create an anonymous session in the aime-space
    const createAnonymousSession = AimeApi.createAnonymousSession(spaceId)
    const sessionResponse = await Wormholes.sendSync(createAnonymousSession, true)
    console.log("Anonymous session created ->", sessionResponse)

    const userId = sessionResponse._user_id
    const conversationId = sessionResponse._conversation_id
    const prompt = "Tell me about the moon"

    //get an answer from the aime server
    const getAnswer = AimeApi.getAnswer(userId, conversationId, prompt)
    const messageResponse = await Wormholes.sendSync(getAnswer, true)
    console.log(prompt, " -> ",prompt)
    console.log("Aime response -> ")
    console.dir(messageResponse)

    const prompt2 = "What is the capital of Israel?"
    const getAnswer2 = AimeApi.getAnswer(userId, conversationId, prompt2)
    const messageResponse2 = await Wormholes.sendSync(getAnswer2, true)
    console.log(prompt2, " -> ",prompt2)
    console.log("Aime response -> ")
    console.dir(messageResponse2)
    
}


main().then(async () => {
}).catch((err) => {
    console.log(err)
})