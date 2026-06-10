import * as Keychain from 'react-native-keychain';

const KEYCHAIN_SERVICE = 'com.squedio.auth.token';
const KEYCHAIN_USERNAME = 'jwt_token';

export type KeychainErrorCode =
  | 'SAVE_FAILED'
  | 'READ_FAILED'
  | 'DELETE_FAILED'
  | 'NOT_FOUND';

export class KeychainError extends Error {
  code: KeychainErrorCode;

  constructor(code: KeychainErrorCode, message: string) {
    super(message);
    this.name = 'KeychainError';
    this.code = code;
  }
}

export async function saveTokenToKeychain(token: string): Promise<void> {
  try {
    const result = await Keychain.setGenericPassword(KEYCHAIN_USERNAME, token, {
      service: KEYCHAIN_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });

    if (!result) {
      throw new KeychainError('SAVE_FAILED', 'Failed to save token to keychain');
    }
  } catch (error) {
    if (error instanceof KeychainError) {
      throw error;
    }
    throw new KeychainError(
      'SAVE_FAILED',
      error instanceof Error ? error.message : 'Keychain save failed',
    );
  }
}

export async function getTokenFromKeychain(): Promise<string | null> {
  try {
    const credentials = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });

    if (!credentials || !credentials.password) {
      return null;
    }

    return credentials.password;
  } catch (error) {
    throw new KeychainError(
      'READ_FAILED',
      error instanceof Error ? error.message : 'Keychain read failed',
    );
  }
}

export async function deleteTokenFromKeychain(): Promise<void> {
  try {
    await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
  } catch (error) {
    throw new KeychainError(
      'DELETE_FAILED',
      error instanceof Error ? error.message : 'Keychain delete failed',
    );
  }
}

export async function hasTokenInKeychain(): Promise<boolean> {
  const token = await getTokenFromKeychain();
  return Boolean(token);
}
