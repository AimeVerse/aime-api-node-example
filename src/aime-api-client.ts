import 'dotenv/config'
import { _x, Wormholes, _xem, WormholeEvents, _xlog } from "xpell-node"

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
        

        //send a prompt to the avatar and display the response
        const prompt = "hi, my name is bond, james bond"
        _xlog.log("************************");
        
        _xlog.log("Sending prompt to the Avatar->" + prompt)
        const answer1 = await aimeApi.sendPrompt(prompt,session)
        _xlog.log("Avatar response:\n",answer1._npc_response)
        _xlog.log("Response conversation-item-id",answer1._conversation_item_id)


        //send another prompt to the avatar and display the response
        const prompt2 = "what is aime avatar?"
        _xlog.log("************************");
        _xlog.log("Q:" , prompt2)
        const answer2 = await aimeApi.sendPrompt(prompt2,session)
        _xlog.log("A:",answer2._npc_response)
        _xlog.log("Response conversation-item-id:",answer2._conversation_item_id)
        
    } catch (error) {
        _xlog.error("Error starting anonymous session")
    } finally {
        aimeApi.disconnect()
    }


    


}

// async function startChat() {


//     const prompt = "Tell me about the moon"

//     //get an answer from the aime server
//     const getAnswerCommand = AimeApi.getAnswerXMessage(userId, conversationId, prompt)
//     const messageResponse = await Wormholes.sendSync(getAnswerCommand, true)
//     console.log("Q: " + prompt)
//     console.log("Aime response -> ",messageResponse)

//     const prompt2 = "What is the capital of Israel?"
//     const getAnswer2 = AimeApi.getAnswerXMessage(userId, conversationId, prompt2)
//     const messageResponse2 = await Wormholes.sendSync(getAnswer2, true)
//     console.log("Q: " + prompt2)
//     console.log("Aime response -> ")
//     console.dir(messageResponse2)
//     Wormholes.close()
    
// }


main().then(async () => {
}).catch((err) => {
    console.log(err)
})