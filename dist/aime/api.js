//AIME API calls
export const AimeApiList = {
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
        }
    }
};
class AimeApiMessageGenerator {
    //helper function to create a message
    createMessage(module, op, params) {
        const message = {
            _module: module,
            _op: op,
            _params: (params) ? params : {}
        };
        return message;
    }
    getEnvironmentName() {
        return AimeApiList["get-environment-name"];
    }
    createAnonymousSession(spaceId) {
        if (!spaceId)
            throw new Error("Space ID is required");
        const msg = AimeApiList["create-user-conversation"];
        msg._params._space_id = spaceId;
        return msg;
    }
    getAnswer(userId, conversationId, prompt) {
        if (!userId)
            throw new Error("User ID is required");
        if (!conversationId)
            throw new Error("Conversation ID is required");
        if (!prompt)
            throw new Error("Prompt is required");
        const msg = AimeApiList["get-answer"];
        msg._params._user_id = userId;
        msg._params._conversation_id = conversationId;
        msg._params._prompt = prompt;
        return msg;
    }
}
export const AimeApi = new AimeApiMessageGenerator();
export default AimeApi;
