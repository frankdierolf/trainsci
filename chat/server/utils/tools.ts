import { z } from 'zod'

/**
 * Detects agent commands in chat messages
 * @param message - The message text to analyze
 * @returns Detection result with agent info
 */
export function detectAgentCommand(message: string) {
  const agentPattern = /@(\w+)-agent/g
  const matches = message.match(agentPattern)

  if (matches && matches.length > 0) {
    const agentName = matches[0].replace('@', '').replace('-agent', '')
    return {
      hasAgent: true,
      agentName,
      cleanMessage: message.replace(agentPattern, '').trim()
    }
  }

  return {
    hasAgent: false,
    agentName: null,
    cleanMessage: message
  }
}

/**
 * Tool definitions for the chat system
 */
export const tools = {
  waitingAgent: {
    description: 'A simple agent that waits for a specified duration and returns a completion message',
    inputSchema: z.object({
      message: z.string().describe('Message to display while waiting').optional(),
      duration: z.number().describe('Duration to wait in seconds').default(4)
    }),
    execute: async ({ message = 'Processing...', duration = 4 }) => {
      // Wait for the specified duration
      await new Promise(resolve => setTimeout(resolve, duration * 1000))

      // Return completion message
      return {
        status: 'completed',
        message: `Waiting agent completed! ${message ? `Initial message: "${message}"` : ''}`,
        duration: `${duration} seconds`,
        timestamp: new Date().toISOString()
      }
    }
  }
}

/**
 * Get text content from message parts
 * @param messageParts - The message parts array
 * @returns Concatenated text content
 */
export function getTextFromParts(messageParts: any[]): string {
  return messageParts
    ?.filter(part => part.type === 'text')
    ?.map(part => part.text)
    ?.join('') || ''
}
