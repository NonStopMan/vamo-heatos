import { mkdtempSync, rmSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { loadEnv } from './env';

describe('loadEnv', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('loads the first existing env file only', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'vamo-heatos-env-'));
    const first = join(tempDir, 'first.env');
    const second = join(tempDir, 'second.env');

    writeFileSync(first, 'SALESFORCE_ENABLED=true\nFIRST_ONLY=1\n');
    writeFileSync(second, 'SALESFORCE_ENABLED=false\nSECOND_ONLY=1\n');

    const loaded = loadEnv([first, second]);

    expect(loaded).toEqual([first]);
    expect(process.env.FIRST_ONLY).toBe('1');
    expect(process.env.SECOND_ONLY).toBeUndefined();
    expect(process.env.SALESFORCE_ENABLED).toBe('true');

    rmSync(tempDir, { recursive: true, force: true });
  });

  it('prefers cwd/.env when running from apps/api', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'vamo-heatos-env-'));
    const apiDir = join(tempDir, 'apps', 'api');
    const apiEnv = join(apiDir, '.env');

    writeFileSync(apiEnv, 'SALESFORCE_ENABLED=true\n');

    const originalCwd = process.cwd();
    process.chdir(apiDir);

    const loaded = loadEnv();

    process.chdir(originalCwd);
    rmSync(tempDir, { recursive: true, force: true });

    expect(loaded).toEqual([apiEnv]);
    expect(process.env.SALESFORCE_ENABLED).toBe('true');
  });

  it('skips missing files without failing', () => {
    const tempDir = mkdtempSync(join(tmpdir(), 'vamo-heatos-env-'));
    const missing = join(tempDir, 'missing.env');

    const loaded = loadEnv([missing]);

    expect(loaded).toEqual([]);

    rmSync(tempDir, { recursive: true, force: true });
  });
});
