/**
 * Telegram Bot API Client
 * https://core.telegram.org/bots/api
 */

export interface TelegramPostConfig {
  botToken: string
  chatId: string
  message: string
  mediaUrl?: string
  mediaType?: 'video' | 'photo'
}

export interface TelegramPostResponse {
  id: string
  status: 'pending' | 'posted' | 'failed'
  error?: string
}

const TELEGRAM_API_URL = 'https://api.telegram.org'

export async function postToTelegram(
  config: TelegramPostConfig
): Promise<TelegramPostResponse> {
  try {
    let method = 'sendMessage'
    const formData = new FormData()

    formData.append('chat_id', config.chatId)
    formData.append('text', config.message)

    // If media is provided, use appropriate method
    if (config.mediaUrl) {
      if (config.mediaType === 'video') {
        method = 'sendVideo'
        formData.append('video', config.mediaUrl)
        formData.append('caption', config.message)
      } else {
        method = 'sendPhoto'
        formData.append('photo', config.mediaUrl)
        formData.append('caption', config.message)
      }
    }

    const response = await fetch(`${TELEGRAM_API_URL}/bot${config.botToken}/${method}`, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.description || 'Failed to post to Telegram')
    }

    const data = await response.json()

    return {
      id: data.result.message_id.toString(),
      status: 'posted',
    }
  } catch (error) {
    console.error('Telegram post error:', error)
    return {
      id: '',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

export async function validateTelegramBot(botToken: string): Promise<boolean> {
  try {
    const response = await fetch(`${TELEGRAM_API_URL}/bot${botToken}/getMe`)
    return response.ok
  } catch {
    return false
  }
}

export async function getChannelMembers(
  botToken: string,
  chatId: string
): Promise<number> {
  try {
    const response = await fetch(
      `${TELEGRAM_API_URL}/bot${botToken}/getChatMembersCount?chat_id=${chatId}`
    )
    const data = await response.json()
    return data.result || 0
  } catch {
    return 0
  }
}
