
export type XpellMessage = {
    _module: string, _op: string, _params: { [name: string]: any }
}

export type AimeSession = {
  _user_id: string,
  _conversation_id: string
}

export type AimePromptResponse = {
  _prompt?: string,
  _conversation_item_id: string,
  _npc_response: string,
  _voice_url?: string
  _intents?: string
}