export type XpellMessage = {
    _module: string;
    _op: string;
    _params: {
        [name: string]: any;
    };
};
export declare const AimeApiList: {
    [name: string]: XpellMessage;
};
declare class AimeApiMessageGenerator {
    createMessage(module: string, op: string, params?: {
        [name: string]: any;
    }): XpellMessage;
    getEnvironmentName(): XpellMessage;
    createAnonymousSession(spaceId: string): XpellMessage;
    getAnswer(userId: string, conversationId: string, prompt: string): XpellMessage;
}
export declare const AimeApi: AimeApiMessageGenerator;
export default AimeApi;
//# sourceMappingURL=api.d.ts.map