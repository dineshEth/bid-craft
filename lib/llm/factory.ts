import { LLMProviderConfig, LLMProviderName, LLMProvider } from './types';
import { MistralLLMProvider } from './providers/mistral';
import { OpenAIProvider } from './providers/openai';
import { GeminiProvider } from './providers/gemini';
import { loadLLMConfig, validateLLMConfig, getAvailableProviders } from './config';

// Map of provider names to their classes
const providerClasses = {
  mistral: MistralLLMProvider,
  openai: OpenAIProvider,
  gemini: GeminiProvider,
};

// Singleton instance cache
let instance: LLMFactory | null = null;

export class LLMFactory {
  private config: LLMProviderConfig;
  private providers: Map<LLMProviderName, LLMProvider> = new Map();

  private constructor(config: LLMProviderConfig) {
    this.config = config;
    this.initializeProviders();
  }

  private initializeProviders() {
    for (const providerName of ['mistral', 'openai', 'gemini'] as LLMProviderName[]) {
      const providerConfig = this.config[providerName];
      
      if (providerConfig.active && providerConfig.apiKey && providerConfig.apiKey.trim() !== '') {
        const ProviderClass = providerClasses[providerName];
        if (ProviderClass) {
          const provider = new ProviderClass(providerConfig.apiKey, providerConfig.model);
          this.providers.set(providerName, provider);
        }
      }
    }
  }

  // Get singleton instance
  static getInstance(): LLMFactory {
    if (!instance) {
      const config = loadLLMConfig();
      const validation = validateLLMConfig(config);
      
      if (!validation.isValid) {
        console.warn('LLM Configuration Warnings:', validation.errors);
      }
      
      instance = new LLMFactory(config);
    }
    return instance;
  }

  // Reset singleton (for testing or configuration reload)
  static resetInstance(): void {
    instance = null;
  }

  // Get all available provider names
  getAvailableProviderNames(): LLMProviderName[] {
    return getAvailableProviders(this.config);
  }

  // Get a specific provider by name
  getProvider(providerName: LLMProviderName): LLMProvider {
    const provider = this.providers.get(providerName);
    
    if (!provider) {
      throw new Error(`Provider '${providerName}' is not available or not active`);
    }
    
    return provider;
  }

  // Get the default provider
  getDefaultProvider(): LLMProvider {
    const provider = this.providers.get(this.config.defaultProvider);
    
    if (!provider) {
      // Fallback to the first available provider
      const available = this.getAvailableProviderNames();
      if (available.length > 0) {
        return this.getProvider(available[0]);
      }
      
      throw new Error('No LLM providers are available. Please check your configuration.');
    }
    
    return provider;
  }

  // Switch the default provider
  switchDefaultProvider(providerName: LLMProviderName): void {
    const available = this.getAvailableProviderNames();
    
    if (!available.includes(providerName)) {
      throw new Error(`Cannot switch to provider '${providerName}'. Available providers: ${available.join(', ')}`);
    }
    
    // Note: In a real implementation, you might want to update the config
    // and reinitialize the factory, but for now we just track it in memory
    this.config.defaultProvider = providerName;
  }

  // Get the current configuration
  getConfig(): LLMProviderConfig {
    return { ...this.config };
  }

  // Check if a provider is available
  isProviderAvailable(providerName: LLMProviderName): boolean {
    return this.providers.has(providerName);
  }
}

// Convenience function to get the default LLM
export function getDefaultLLM(): LLMProvider {
  return LLMFactory.getInstance().getDefaultProvider();
}

// Convenience function to get a specific LLM
export function getLLM(providerName: LLMProviderName): LLMProvider {
  return LLMFactory.getInstance().getProvider(providerName);
}

// Convenience function to get available providers
export function getAvailableLLMs(): LLMProviderName[] {
  return LLMFactory.getInstance().getAvailableProviderNames();
}
