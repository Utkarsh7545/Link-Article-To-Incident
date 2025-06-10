import link_article_to_incident from './functions/link_article_to_incident';

export const functionFactory = {
  // Add your functions here
  link_article_to_incident,
} as const;

export type FunctionFactoryType = keyof typeof functionFactory;
