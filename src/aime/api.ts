//AIME API calls
import fs from "fs"
import path from "path"
import { fileURLToPath } from 'url';
import {  dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { _x, Wormholes, _xem, WormholeEvents, _xlog } from "xpell-node"
import { XpellMessage, AimeSession, AimePromptResponse} from "./api-types.js"

export const AimeApiList: {[name: string]: XpellMessage} = {
    "server-auth": {
        _module: "server-manager",
        _op: "auth-server",
        _params: {
            _t: undefined
        }
    },
    "get-environment-name": {
        _module: "xenvironment",
        _op: "get-name",
        _params: {}
    },
    "create-user-conversation": {
        _module: "user-manager",
        _op: "create-user-conversation",
        _params: {
            _space_id: undefined
        }
    },

    "get-answer": {
        _module: "conversation-manager",
        _op: "get-answer",
        _params: {
            _user_id: undefined,
            _conversation_id: undefined,
            _prompt: undefined,
            _generate_voice: false
        }
    },

    "get-answer-from-voice": {
        _module: "conversation-manager",
        _op: "get-answer-from-voice",
        _params: {
            _user_id: undefined,
            _conversation_id: undefined,
            _voice_data: undefined, //base64 encoded voice data
            _generate_voice: false
        }
    }
    
}

class AimeApiMessageGenerator {


    //helper function to create a message
    createXMessage(module: string, op: string, params?: { [name: string]: any }) {
        const message: XpellMessage = {
            _module: module,
            _op: op,
            _params: (params) ? params: {}
        }
        return message
    }

    getEnvironmentNameXMessage() {
        return AimeApiList["get-environment-name"]
    }

    createAnonymousSessionXMessage(spaceId: string) {
        if (!spaceId) throw new Error("Space ID is required")
        const msg = AimeApiList["create-user-conversation"]
        msg._params._space_id = spaceId
        return msg
    }

    getAnswerXMessage(userId: string, conversationId: string, prompt: string,voice:boolean) {
        if (!userId) throw new Error("User ID is required")
        if (!conversationId) throw new Error("Conversation ID is required")
        if (!prompt) throw new Error("Prompt is required")
        const msg = AimeApiList["get-answer"]
        msg._params._user_id = userId
        msg._params._conversation_id = conversationId
        msg._params._prompt = prompt
        msg._params._generate_voice = voice
        return msg
    }


    getAnswerFromVoiceXMessage(userId: string, conversationId: string, voiceData: string,voice:boolean) {
        if (!userId) throw new Error("User ID is required")
        if (!conversationId) throw new Error("Conversation ID is required")
        if (!voiceData) throw new Error("Voice data is required")

        const msg = AimeApiList["get-answer-from-voice"]
        msg._params._user_id = userId
        msg._params._conversation_id = conversationId
        msg._params._voice_data = voiceData
        msg._params._generate_voice = voice
        return msg
    }

    getServerAuthXMessage(token: string) {
        if (!token) throw new Error("Token is required")
        const msg = AimeApiList["server-auth"]
        msg._params._t = token
        return msg
    }
}


export class AimeAPI {
    private _wormhole_token: string
    private _wormhole_url: string
    private _xp: AimeApiMessageGenerator //xpell message generator (helper class)
    
    constructor(serverToken: string, serverUrl: string) {
        
        if (!serverToken || !serverUrl) {
            throw new Error("Wormhole token or url not found")
        } else {
            this._wormhole_token = serverToken
            this._wormhole_url = serverUrl
            this._xp = new AimeApiMessageGenerator()
        }
    }

    /**
     * This function connects to the Aime server
     * @returns Promise<boolean> - true if the connection is successful
     */
    async connect() {
        return new Promise((resolve, reject) => {
            _xem.on(WormholeEvents.WormholeOpen, async (data: any) => {
                const serverAuth = this._xp.getServerAuthXMessage(this._wormhole_token)
                // send the server auth command
                try {
                    const resA = await Wormholes.sendSync(serverAuth)
                    resolve(true)
                } catch (error) {
                    _xlog.log("Wormhole Error", error)
                    reject(error)
                }
            })
            Wormholes.open(this._wormhole_url)
        })
    }


    /**
     * This function disconnects from the Aime server
     */
    async disconnect() {
        Wormholes.close()
    }

    //optional function to get the environment name
    async getEnvName() {
        // get the environment name from the server - example of a simple command
        try{
            return await Wormholes.sendSync(this._xp.getEnvironmentNameXMessage())
        } catch (error) {
            _xlog.error("Error getting environment name")
        }
    }


    /**
     * This function creates new anonymous user in Aime system
     * and starts new conversation with the NPC (Avatar) in the space
     * (The Space and the NPC is already defined in the system)
     * @param spaceId - Aime Space ID to create the conversation in
     * @throws Error - Wormholes and API errors will be thrown as errors
     * @returns AnonymousSessionResponse
     * {
     *      _user_id: string, // the id of the new anonymous user
     *      _conversation_id: string // the id of the new conversation between the user and the npc
     * }
     */
    async startAnonymousSession(spaceId:string) : Promise<AimeSession> {
        const createAnonymousSession = this._xp.createAnonymousSessionXMessage(spaceId)
        return await Wormholes.sendSync(createAnonymousSession)
    }


    /**
     * This function sends a prompt to the Aime server and returns the response
     * @param prompt - The prompt to send to the Aime server (can be a question in a conversation or a command to the NPC)
     * @param session - The session object returned from startAnonymousSession
     * @param generateVoice - If true, the server will generate a voice response
     * @returns AimePromptResponse
     * {
     *     _conversation_item_id: string, // the id of the conversation item
     *     _npc_response: string // the response from the NPC
     *     _voice_url?: string // the url of the voice response (if generated)
     * }
     */
    async sendPrompt(prompt: string,session:AimeSession,generateVoice:boolean = true): Promise<AimePromptResponse>{
        const getAnswerCommand = this._xp.getAnswerXMessage(session._user_id, session._conversation_id, prompt,generateVoice)
        return await Wormholes.sendSync(getAnswerCommand, true)
    }


    /**
     * This function sends a voice prompt to the Aime server and returns the response
     * @param voiceFileName 
     * @param session 
     * @param generateVoice 
     * @returns 
     */
    async sendVoicePrompt(voiceFileName: string,session:AimeSession,generateVoice:boolean = true): Promise<AimePromptResponse>{
        try {
            const filePath = path.join(__dirname, voiceFileName)
            if(fs.existsSync(filePath)){
                try {
                    const voiceData = fs.readFileSync(filePath).toString('base64')
                    const getAnswerFromVoiceCommand = this._xp.getAnswerFromVoiceXMessage(session._user_id, session._conversation_id, voiceData,generateVoice)
                    const rres =  await Wormholes.sendSync(getAnswerFromVoiceCommand, true)
                    return rres
                } catch (error) {
                    throw new Error("Error reading voice file " + voiceFileName + " : " + error)
                }
            } else throw new Error("Voice file not found")
        } catch (error) {
            throw new Error("Error reading voice file " + voiceFileName + " : " + error)
        }
    }

}


export default AimeAPI


