import 'dotenv/config'
import { _x, Wormholes, _xem, WormholeEvents, _xlog } from "xpell-node"

async function main() {


    _x.verbose() // enable verbose mode
    _x.start() // start the xpell engine


    const getEnvironmentNameMessage = {
        _module: "xenvironment",
        _op: "get-name"
    }



    const usetAuth = {
        _module: "user-manager",
        _op: "auth",
        _params: {
            email: "admin",
            password: "admin"
        }
    }


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

    const wormholeToken = process.env.AIME_SERVER_TOKENw
    const wormholeUrl = process.env.AIME_SERVER_URL
    if(!wormholeToken || !wormholeUrl){
        throw new Error("Wormhole token or url not found")
    } else {
        Wormholes.open(<any>wormholeUrl)
    }
}

async function start() {
    const res = await Wormholes.sendSync({
        _module: "xenvironment",
        _op: "get-name"
    }, true)
    console.log(res)

    // const cmd = {
    //     _module: "user-manager",
    //     _op: "create-user",
    //     _params: {
    //         _email: "japan5@gmail.com",
    //         _password: "admin",
    //         _first_name: "japanese3",
    //         _last_name: "server3",
    //         _space_id: "65d4a663618087d773dd38e4"
    //     }
    // }

    // const result = await Wormholes.sendSync(cmd,true)
    // console.log("RES",result);

    // const createServer = {
    //     _module: "server-manager",
    //     _op: "add-server",
    //     _params: {
    //         _name: "japanese server"
    //     }
    // }
    // const resS = await Wormholes.sendSync(createServer,true)
    // console.log("Server created",resS)


    // const xcmd = {
    //     _module: "conversation-manager",
    //     _op: "get-answer",
    //     _params: {
    //         _user_id: "65d60e77d49fec391c1efa7c",
    //         // _user_id: "6588350047a2c29ad6fb7242",
    //         _conversation_id: "65d60e77d49fec391c1efa7e",
    //         _prompt: "Why is the sky black?",
    //     }
    // }
    // const resG = await Wormholes.sendSync(xcmd,true)
    // console.log("Gpt response: ",resG );
}


main().then(async () => {
}).catch((err) => {
    console.log(err)
})