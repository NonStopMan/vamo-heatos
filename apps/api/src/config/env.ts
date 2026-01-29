import { existsSync } from 'fs';
import { resolve, sep } from 'path';
import { config as loadDotEnv } from 'dotenv';

const defaultEnvPaths = (): string[] => {
  const cwd = process.cwd();
  const isApiCwd = cwd.endsWith(`${sep}apps${sep}api`);
  return [
    isApiCwd ? resolve(cwd, '.env') : resolve(cwd, 'apps/api/.env'),
    resolve(__dirname, '..', '.env'),
  ];
};

export const loadEnv = (paths: string[] = defaultEnvPaths()): string[] => {
  const loaded: string[] = [];

  const envPath = paths.find((candidate) => existsSync(candidate));
  if (!envPath) {
    return loaded;
  }

  const result = loadDotEnv({ path: envPath, override: true });
  if (!result.error) {
    loaded.push(envPath);
  }

  return loaded;
};
