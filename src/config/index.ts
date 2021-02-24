import { TeddyAppConfig } from './config';

// export let config: TeddyAppConfig | null = null;

// export const loadEnvironmentConfiguration = async () => {
//   const env = process.env.NODE_ENV;
//   console.log('Importing specific config file');
//   console.log(env);
//   config = (await import(`./config.${env}.ts`)).config;
//   console.log(JSON.stringify(config));
// };

// const env = process.env.NODE_ENV || 'development';
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const environmentConfig = require('./config.' + env).config as TeddyAppConfig;
import { config } from './config.development';

export const AppConfig = {
  ...config,
  isStaff: (email: string) => {
    return config.developerEmails.includes(email);
  },
  canViewSwagger: () => true,
};
