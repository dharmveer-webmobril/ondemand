import { Pressable, View } from 'react-native';
import { PaymentMethodModal, ServiceSummeryCard } from '@components';
import {
  CustomButton,
  CustomInput,
  CustomText,
  VectoreIcons,
} from '@components/common';
import ServiceForModal from '@components/provider/ServiceForModal';
import { formatAddress } from '@utils/tools';
import {
  Address,
  OtherPersonDetails,
  PaymentModeKey,
} from './checkoutHelpers';

const PAYMENT_MODE_KEYS: PaymentModeKey[] = [
  'cash',
  'online',
  'wallet',
  'wallet_partial',
];

type SharedProps = {
  styles: any;
  t: any;
};

type AppointmentDetailsSectionProps = {
  styles: any;
  bookingData: any;
  totalPrice: number;
};

type ServiceForSectionProps = SharedProps & {
  theme: any;
  serviceFor: 'self' | 'other';
  onPress: () => void;
};

type AddressSectionProps = SharedProps & {
  needsAddress: boolean;
  serviceFor: 'self' | 'other';
  otherPersonDetails: OtherPersonDetails;
  selectedAddress: Address | null;
  onPress: () => void;
};

type PaymentSectionProps = {
  styles: any;
  t: any;
  paymentMode: PaymentModeKey;
  setPaymentMode: (mode: PaymentModeKey) => void;
  setWalletPartialAmount: (value: string) => void;
  walletPartialAmount: string;
  walletBalance: number;
  totalPrice: number;
  walletFullyCovers: boolean;
  remainingAfterWallet: number;
  insufficientWalletBalance: boolean;
  invalidPartialWalletAmount: boolean;
};

type CheckoutFooterProps = {
  styles: any;
  theme: any;
  t: any;
  onPress: () => void;
  disabled: boolean;
  isLoading: boolean;
};

type CheckoutModalsProps = {
  serviceFor: 'self' | 'other';
  showServiceForModal: boolean;
  showPaymentModal: boolean;
  closeServiceForModal: () => void;
  closePaymentModal: () => void;
  onServiceForConfirm: (value: 'self' | 'other') => void;
  onPaymentMethodConfirm: (value: 'paypal' | 'stripe' | 'cash') => void;
  paymentType: 'paypal' | 'stripe' | 'cash';
  paymentMode: PaymentModeKey;
};

const getLocationName = (value: Address['city'] | Address['country']) => {
  if (!value) {
    return '';
  }

  return typeof value === 'string' ? value : value?.name ?? '';
};

const renderAddressText = (address: Address) => {
  return formatAddress({
    line1: address?.line1 ?? '',
    line2: address?.line2 ?? '',
    landmark: address?.landmark ?? '',
    pincode: address?.pincode ?? '',
    city: getLocationName(address?.city),
    country: getLocationName(address?.country),
  });
};

export const AppointmentDetailsSection = ({
  styles,
  bookingData,
  totalPrice,
}: AppointmentDetailsSectionProps) => {
  return (
    <View style={styles.section}>
      <CustomText style={styles.sectionTitle}>Appointment Details</CustomText>
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <CustomText style={styles.summaryLabel}>Date:</CustomText>
          <CustomText style={styles.summaryValue}>{bookingData?.date}</CustomText>
        </View>
        <View style={styles.summaryRow}>
          <CustomText style={styles.summaryLabel}>Time:</CustomText>
          <CustomText style={styles.summaryValue}>{bookingData?.timeSlot}</CustomText>
        </View>
        <View style={styles.summaryRow}>
          <CustomText style={styles.summaryLabel}>Total:</CustomText>
          <CustomText style={styles.summaryValue}>${totalPrice.toFixed(2)}</CustomText>
        </View>
      </View>
    </View>
  );
};

export const SelectedServicesSection = ({ selectedServices }: { selectedServices: any[] }) => {
  if (!selectedServices?.length) {
    return null;
  }

  return (
    <ServiceSummeryCard
      pageName="checkout"
      services={selectedServices}
      onRemoveService={() => {}}
      onAddAddOns={() => {}}
      onAddService={() => {}}
    />
  );
};

export const ServiceForSection = ({
  styles,
  theme,
  t,
  serviceFor,
  onPress,
}: ServiceForSectionProps) => {
  return (
    <View style={styles.section}>
      <CustomText style={styles.sectionTitle}>Service For</CustomText>
      <Pressable style={styles.serviceForCard} onPress={onPress}>
        <View style={styles.serviceForContent}>
          <VectoreIcons
            name={serviceFor === 'self' ? 'person' : 'people'}
            icon="Ionicons"
            size={theme.SF(20)}
            color={theme.colors.primary}
          />
          <CustomText style={styles.serviceForText}>
            {serviceFor === 'self' ? t('checkout.self') : t('checkout.other')}
          </CustomText>
        </View>
        <VectoreIcons
          name="chevron-forward"
          icon="Ionicons"
          size={theme.SF(20)}
          color={theme.colors.lightText}
        />
      </Pressable>
    </View>
  );
};

export const AddressSection = ({
  styles,
  t,
  needsAddress,
  serviceFor,
  otherPersonDetails,
  selectedAddress,
  onPress,
}: AddressSectionProps) => {
  if (!(needsAddress && serviceFor === 'self') && serviceFor !== 'other') {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <CustomText style={styles.sectionTitle}>
          {serviceFor === 'other'
            ? t('checkout.otherPersonDetails') || 'Other Person Details'
            : t('checkout.yourAddress') || 'Your Address'}
        </CustomText>
        <Pressable onPress={onPress}>
          <CustomText style={styles.changeLink}>
            {serviceFor === 'other'
              ? otherPersonDetails
                ? t('checkout.changeAddress') || 'Change'
                : t('checkout.addAddress') || 'Add other person details'
              : selectedAddress
                ? t('checkout.changeAddress')
                : t('checkout.addAddress')}
          </CustomText>
        </Pressable>
      </View>

      {serviceFor === 'other' ? (
        otherPersonDetails ? (
          <View style={styles.addressCard}>
            <CustomText style={styles.addressTitle}>{otherPersonDetails?.name}</CustomText>
            <CustomText style={styles.addressText}>{otherPersonDetails?.email}</CustomText>
            <CustomText style={styles.addressPhone}>
              {otherPersonDetails?.countryCode} {otherPersonDetails?.phone}
            </CustomText>
            {otherPersonDetails?.address && (
              <CustomText style={styles.addressText}>
                {renderAddressText(otherPersonDetails.address)}
              </CustomText>
            )}
          </View>
        ) : (
          <View style={styles.emptyAddressCard}>
            <CustomText style={styles.emptyAddressText}>
              {t('checkout.addOtherPersonDetailsPrompt') ||
                'Add other person details to continue'}
            </CustomText>
          </View>
        )
      ) : selectedAddress ? (
        <View style={styles.addressCard}>
          <CustomText style={styles.addressTitle}>{selectedAddress?.name}</CustomText>
          <CustomText style={styles.addressText}>
            {renderAddressText(selectedAddress)}
          </CustomText>
          <CustomText style={styles.addressPhone}>{selectedAddress?.contact}</CustomText>
        </View>
      ) : (
        <View style={styles.emptyAddressCard}>
          <CustomText style={styles.emptyAddressText}>
            {t('checkout.noAddressSelected')}
          </CustomText>
        </View>
      )}
    </View>
  );
};

export const PaymentSection = ({
  styles,
  t,
  paymentMode,
  setPaymentMode,
  setWalletPartialAmount,
  walletPartialAmount,
  walletBalance,
  totalPrice,
  walletFullyCovers,
  remainingAfterWallet,
  insufficientWalletBalance,
  invalidPartialWalletAmount,
}: PaymentSectionProps) => {
  const getPaymentModeLabel = (key: PaymentModeKey) => {
    switch (key) {
      case 'cash':
        return t('checkout.paymentModes.cash');
      case 'online':
        return t('checkout.paymentModes.online');
      case 'wallet':
        return t('checkout.paymentModes.walletFull');
      case 'wallet_partial':
        return t('checkout.paymentModes.walletPartial');
      default:
        return String(key);
    }
  };

  return (
    <View style={styles.section}>
      <CustomText style={styles.sectionTitle}>
        {t('checkout.paymentModes.paymentTitle')}
      </CustomText>
      <View style={styles.paymentModeRow}>
        {PAYMENT_MODE_KEYS.map((key) => {
          const isSelected = paymentMode === key;

          return (
            <Pressable
              key={key}
              style={styles.paymentRadioRow}
              onPress={() => {
                setPaymentMode(key);
                if (key !== 'wallet_partial') {
                  setWalletPartialAmount('');
                }
              }}
            >
              <View
                style={[
                  styles.radioButton,
                  isSelected && styles.radioButtonSelected,
                ]}
              >
                {isSelected && <View style={styles.radioButtonInner} />}
              </View>
              <CustomText style={styles.paymentRadioLabel}>
                {getPaymentModeLabel(key)}
              </CustomText>
            </Pressable>
          );
        })}
      </View>

      {paymentMode === 'wallet' && (
        <>
          <View style={styles.walletCard}>
            <View style={styles.walletRow}>
              <CustomText style={styles.walletLabel}>
                {t('checkout.wallet.walletBalance')}
              </CustomText>
              <CustomText style={styles.walletValue}>${walletBalance.toFixed(2)}</CustomText>
            </View>
            <View style={styles.walletRow}>
              <CustomText style={styles.walletLabel}>
                {t('checkout.wallet.orderTotal')}
              </CustomText>
              <CustomText style={styles.walletValue}>${totalPrice.toFixed(2)}</CustomText>
            </View>
            <View style={[styles.walletRow, styles.walletRowLast]}>
              <CustomText style={styles.walletLabelBold}>
                {t('checkout.wallet.remaining')}
              </CustomText>
              <CustomText style={styles.walletValueBold}>
                {walletFullyCovers
                  ? t('checkout.wallet.fullyCovered')
                  : `$${Math.max(0, totalPrice - walletBalance).toFixed(2)}`}
              </CustomText>
            </View>
          </View>
          {insufficientWalletBalance && (
            <CustomText style={styles.walletErrorText}>
              {t('checkout.wallet.insufficientWallet')}
            </CustomText>
          )}
        </>
      )}

      {paymentMode === 'wallet_partial' && (
        <>
          <View style={styles.walletCard}>
            <CustomText style={styles.walletInputLabel}>
              {t('checkout.wallet.amountFromWallet', {
                max: Math.min(walletBalance, totalPrice).toFixed(2),
              })}
            </CustomText>
            <View style={styles.walletInputWrap}>
              <CustomInput
                value={walletPartialAmount}
                onChangeText={setWalletPartialAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                marginTop={0}
                errortext={
                  invalidPartialWalletAmount
                    ? t('checkout.wallet.partialWalletError')
                    : undefined
                }
              />
            </View>
            <View style={styles.walletRow}>
              <CustomText style={styles.walletLabel}>
                {t('checkout.wallet.walletBalance')}
              </CustomText>
              <CustomText style={styles.walletValue}>${walletBalance.toFixed(2)}</CustomText>
            </View>
            <View style={styles.walletRow}>
              <CustomText style={styles.walletLabel}>
                {t('checkout.wallet.orderTotal')}
              </CustomText>
              <CustomText style={styles.walletValue}>${totalPrice.toFixed(2)}</CustomText>
            </View>
            <View style={[styles.walletRow, styles.walletRowLast]}>
              <CustomText style={styles.walletLabelBold}>
                {t('checkout.wallet.remainingPayByCard')}
              </CustomText>
              <CustomText style={styles.walletValueBold}>
                ${remainingAfterWallet.toFixed(2)}
              </CustomText>
            </View>
            {remainingAfterWallet > 0 && (
              <CustomText style={styles.walletHint}>
                {t('checkout.wallet.remainingPaymentHint')}
              </CustomText>
            )}
          </View>
          {/* {invalidPartialWalletAmount && (
            <CustomText style={styles.walletErrorText}>
              You selected partial wallet payment, so please enter an amount less than the order amount.
            </CustomText>
          )} */}
          {!invalidPartialWalletAmount && insufficientWalletBalance && (
            <CustomText style={styles.walletErrorText}>
              {t('checkout.wallet.insufficientWallet')}
            </CustomText>
          )}
        </>
      )}
    </View>
  );
};

export const CheckoutFooter = ({
  styles,
  theme,
  t,
  onPress,
  disabled,
  isLoading,
}: CheckoutFooterProps) => {
  return (
    <View style={styles.footer}>
      <CustomButton
        title={t('checkout.confirmBooking')}
        onPress={onPress}
        buttonStyle={styles.confirmButton}
        backgroundColor={theme.colors.primary}
        textColor={theme.colors.white}
        disable={disabled}
        isLoading={isLoading}
      />
    </View>
  );
};

export const CheckoutModals = ({
  serviceFor,
  showServiceForModal,
  showPaymentModal,
  closeServiceForModal,
  closePaymentModal,
  onServiceForConfirm,
  onPaymentMethodConfirm,
  paymentType,
  paymentMode,
}: CheckoutModalsProps) => {
  return (
    <>
      <ServiceForModal
        visible={showServiceForModal}
        onClose={closeServiceForModal}
        onConfirm={onServiceForConfirm}
        selectedServiceFor={serviceFor}
      />
      <PaymentMethodModal
        visible={showPaymentModal}
        onClose={closePaymentModal}
        onConfirm={onPaymentMethodConfirm}
        selectedPaymentMethod={paymentType}
        allowedMethods={
          paymentMode === 'online' || paymentMode === 'wallet_partial'
            ? ['stripe', 'paypal']
            : undefined
        }
      />
    </>
  );
};
