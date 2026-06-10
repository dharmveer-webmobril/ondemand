import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics({ allowDeviceCredentials: false });

export type BiometricErrorCode =
  | 'NOT_AVAILABLE'
  | 'NOT_ENROLLED'
  | 'CANCELLED'
  | 'FAILED'
  | 'UNKNOWN';

export class BiometricError extends Error {
  code: BiometricErrorCode;

  constructor(code: BiometricErrorCode, message: string) {
    super(message);
    this.name = 'BiometricError';
    this.code = code;
  }
}

export interface BiometricAvailability {
  available: boolean;
  biometryType: keyof typeof BiometryTypes | null;
}

export async function checkBiometricAvailability(): Promise<BiometricAvailability> {
  try {
    const { available, biometryType } = await rnBiometrics.isSensorAvailable();

    return {
      available,
      biometryType: (biometryType as keyof typeof BiometryTypes) ?? null,
    };
  } catch {
    return { available: false, biometryType: null };
  }
}

export function getBiometricLabel(
  biometryType: keyof typeof BiometryTypes | null,
): string {
  switch (biometryType) {
    case BiometryTypes.FaceID:
      return 'Face ID';
    case BiometryTypes.TouchID:
      return 'Touch ID';
    case BiometryTypes.Biometrics:
      return 'Fingerprint';
    default:
      return 'Biometric';
  }
}

export async function authenticateWithBiometrics(
  promptMessage = 'Authenticate to continue',
): Promise<void> {
  const { available } = await checkBiometricAvailability();

  if (!available) {
    throw new BiometricError(
      'NOT_ENROLLED',
      'Biometric authentication is not available or no credentials are enrolled',
    );
  }

  try {
    const { success, error } = await rnBiometrics.simplePrompt({
      promptMessage,
      cancelButtonText: 'Cancel',
    });

    if (success) {
      return;
    }

    const normalizedError = (error ?? '').toLowerCase();

    if (
      normalizedError.includes('cancel') ||
      normalizedError.includes('user') ||
      normalizedError.includes('dismiss')
    ) {
      throw new BiometricError('CANCELLED', 'Biometric authentication was cancelled');
    }

    throw new BiometricError('FAILED', error || 'Biometric authentication failed');
  } catch (error) {
    if (error instanceof BiometricError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : 'Unknown biometric error';
    const normalizedMessage = message.toLowerCase();

    if (normalizedMessage.includes('cancel')) {
      throw new BiometricError('CANCELLED', message);
    }

    if (normalizedMessage.includes('not available')) {
      throw new BiometricError('NOT_AVAILABLE', message);
    }

    throw new BiometricError('UNKNOWN', message);
  }
}
