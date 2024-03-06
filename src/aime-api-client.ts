import 'dotenv/config'
import { Wormholes, _x, _xem, _xlog } from "xpell-node"

import {AimeAPI} from "./aime/api.js"
import { AimeSession } from './aime/api-types.js'


async function main() {
    _x.verbose() // enable verbose mode (log to the console xpell & xlog messages)
    // _x.start() // start the xpell engine and keeps the server running (optional in this project)


    const wormholeToken = process.env.AIME_SERVER_TOKEN
    const wormholeUrl = process.env.AIME_SERVER_URL
    
    //create an instance of the AimeAPI
    const aimeApi = new AimeAPI(<string>wormholeToken,<string>wormholeUrl)
    
    //connect to the server
    await aimeApi.connect()
    
    //check that the server is ok by getting the server name (environment name)
    const envName = await aimeApi.getEnvName()
    _xlog.log("Server Name is " + envName)

    const spaceId = process.env.AIME_SPACE_ID //space id to start the conversation is 
    if(!spaceId) throw new Error("Missing Space ID")

    try {
        //start an anonymous session (creates an anonymous user and start new conversation with the npc in the space)
        const session:AimeSession = await aimeApi.startAnonymousSession(<string>spaceId)
        _xlog.log("Anonymous session created user-id:" +session._user_id + " conversation-id:" + session._conversation_id)
        

        const intents = [ "general info","room service", "get a taxi", "order food", "check in", "check out","spa inquiry" , "book a flight"]
        
        
        const fileUrl = "../../assets/test.mp3" //project runs in dist/aime 
        const npcResponseFromVoice = await aimeApi.sendVoicePrompt(fileUrl,session,false,true,intents)
        _xlog.log("[Server Response]",npcResponseFromVoice)
        if(npcResponseFromVoice._intents){
            try {
                const intent = JSON.parse(<string>npcResponseFromVoice._intents)
                _xlog.log("[Intent]",intent);
            } catch (error) {
                _xlog.log("Error parsing intents",error);
            }
        }

        const userPrompt = "I need 2 pillows and one blanket"
        const npcResponseFromText = await aimeApi.sendPrompt(userPrompt,session,false,true,intents)
        _xlog.log("[Server Response]",npcResponseFromText);
        if(npcResponseFromText._intents){
            try {
                const intent = JSON.parse(<string>npcResponseFromText._intents)
                _xlog.log("[Intent]",intent);
            } catch (error) {
                _xlog.log("Error parsing intents",error);
            }
        }

    } catch (error) {
        _xlog.error("Error starting anonymous session" + error)
    } finally {
        aimeApi.disconnect()
    }
}


main().then(async () => {
}).catch((err) => {
    console.log(err)
})
