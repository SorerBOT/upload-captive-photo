import envs from '../envs.js';

export const getEnv = () => {
  if (envs.ci) {
    return 'ci';
  }
  if (envs.localhost || envs.test) {
    return 'dev';
  }
  if (envs.staging) {
    return 'stage';
  }
  if (envs.dev) {
    return 'dev';
  }
  if (envs.production) {
    return 'prod';
  }
  return 'local';
};
export const isTestableEnv = () => ['ci', 'local', 'test', 'dev'].includes(getEnv());
