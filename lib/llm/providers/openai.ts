import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, SystemMessage, AIMessage } from '@langchain/core/messages';
import { LLMProvider, ChatMessage } from '../types';

export class OpenAIProvider implements LLMProvider {
  name = 'openai' as const;
  model: string;
  apiKey: string;
  private client: ChatOpenAI;

  constructor(apiKey: string, model: string) {
    this.apiKey = apiKey;
    this.model = model;
    
    this.client = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: model,
    });
  }

  private convertToLangChainMessages(messages: ChatMessage[]) {
    return messages.map(msg => {
      if (msg.role === 'system') return new SystemMessage(msg.content);
      if (msg.role === 'user') return new HumanMessage(msg.content);
      if (msg.role === 'assistant') return new AIMessage(msg.content);
      return new HumanMessage(msg.content);
    });
  }

  async invoke(prompt: string, options?: { messages?: ChatMessage[]; temperature?: number }): Promise<string> {
    try {
      const messages = options?.messages || [
        { role: 'user', content: prompt } as ChatMessage,
      ];

      const langChainMessages = this.convertToLangChainMessages(messages);
      
      const response = await this.client.invoke(langChainMessages, {
      });

      if (typeof response.content === 'string') {
        return response.content;
      }

      // Handle different response formats
      if (Array.isArray(response.content)) {
        return response.content
          .filter(item => typeof item === 'string' || (item && typeof item.text === 'string'))
          .map(item => typeof item === 'string' ? item : item.text)
          .join('\n');
      }

      return JSON.stringify(response.content);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async stream(prompt: string, options?: { messages?: ChatMessage[]; temperature?: number }): Promise<AsyncIterable<string>> {
    try {
      const messages = options?.messages || [
        { role: 'user', content: prompt } as ChatMessage,
      ];

      const langChainMessages = this.convertToLangChainMessages(messages);
      
      const stream = await this.client.stream(langChainMessages, {
      });

      return {
        [Symbol.asyncIterator]() {
          return {
            async next() {
              const { value, done } = await stream.next();
              if (done) return { done: true, value: undefined };
              
              const content = value?.content || '';
              return { done: false, value: typeof content === 'string' ? content : '' };
            },
          };
        },
      };
    } catch (error) {
      console.error('OpenAI Stream Error:', error);
      throw new Error(`OpenAI Stream Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
