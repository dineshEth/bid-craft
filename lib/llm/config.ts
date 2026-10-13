import { LLMProviderConfig, LLMProviderName } from './types';

// Load LLM configuration from environment variables
export function loadLLMConfig(): LLMProviderConfig {
  return {
    mistral: {
      active: process.env.MISTRAL_ACTIVE?.toLowerCase() === 'true',
      apiKey: process.env.MISTRAL_API_KEY || '',
      model: process.env.MISTRAL_MODEL || 'mistral-large-latest',
      provider: 'mistral',
    },
    openai: {
      active: process.env.OPENAI_ACTIVE?.toLowerCase() === 'true',
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      provider: 'openai',
    },
    gemini: {
      active: process.env.GEMINI_ACTIVE?.toLowerCase() === 'true',
      apiKey: process.env.GEMINI_API_KEY || '',
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      provider: 'gemini',
    },
    defaultProvider: (process.env.DEFAULT_LLM_PROVIDER as LLMProviderName) || 'mistral',
  };
}

// Validate LLM configuration
export function validateLLMConfig(config: LLMProviderConfig): {
  isValid: boolean;
  errors: string[];
  activeProviders: LLMProviderName[];
} {
  const errors: string[] = [];
  const activeProviders: LLMProviderName[] = [];

  // Check each provider
  for (const providerName of ['mistral', 'openai', 'gemini'] as LLMProviderName[]) {
    const providerConfig = config[providerName];
    
    if (providerConfig.active) {
      activeProviders.push(providerName);
      
      if (!providerConfig.apiKey || providerConfig.apiKey.trim() === '') {
        errors.push(`Provider ${providerName} is active but missing API key`);
      }
      
      if (!providerConfig.model || providerConfig.model.trim() === '') {
        errors.push(`Provider ${providerName} is active but missing model`);
      }
    }
  }

  // Check if default provider is active
  if (!activeProviders.includes(config.defaultProvider)) {
    errors.push(`Default provider '${config.defaultProvider}' is not active. Active providers: ${activeProviders.join(', ')}`);
  }

  // Check if at least one provider is active
  if (activeProviders.length === 0) {
    errors.push('No LLM providers are active. At least one provider must be active.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    activeProviders,
  };
}

// Get available providers (active and with valid API keys)
export function getAvailableProviders(config: LLMProviderConfig): LLMProviderName[] {
  const available: LLMProviderName[] = [];
  
  for (const providerName of ['mistral', 'openai', 'gemini'] as LLMProviderName[]) {
    const providerConfig = config[providerName];
    if (providerConfig.active && providerConfig.apiKey && providerConfig.apiKey.trim() !== '') {
      available.push(providerName);
    }
  }
  
  return available;
}

// Get configuration for a specific provider
export function getProviderConfig(config: LLMProviderConfig, providerName: LLMProviderName) {
  return config[providerName];
}
