import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SelectOptionModal, { OptionItem } from '@components/common/SelectOptionModal';

type DeliveryMode = 'atHome' | 'online' | 'onPremises' | null;

type DeliveryModeModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (mode: DeliveryMode) => void;
  selectedMode?: any;
  /**
   * When provided, only modes in this list are shown (e.g. service.preferences).
   * When omitted, all three modes are shown (e.g. category provider list).
   */
  availableModes?: string[];
};

export default function DeliveryModeModal({
  visible,
  onClose,
  onConfirm,
  selectedMode = null,
  availableModes,
}: DeliveryModeModalProps) {
  const { t, i18n } = useTranslation();

  const deliveryModeOptions: OptionItem[] = useMemo(
    () => [
      {
        id: 'atHome',
        label: t('home.servicePreference.atHome'),
        icon: 'home',
        iconType: 'MaterialIcons',
      },
      {
        id: 'online',
        label: t('home.servicePreference.online'),
        icon: 'laptop',
        iconType: 'MaterialIcons',
      },
      {
        id: 'onPremises',
        label: t('home.servicePreference.onPremises'),
        icon: 'storefront',
        iconType: 'MaterialIcons',
      },
    ],
    [t, i18n.language],
  );

  const knownModeIds = useMemo(
    () => new Set(deliveryModeOptions.map(o => o.id)),
    [deliveryModeOptions],
  );

  const options = useMemo(() => {
    if (availableModes === undefined) {
      return deliveryModeOptions;
    }
    const allowed = new Set(
      availableModes.filter(id => knownModeIds.has(id)),
    );
    return deliveryModeOptions.filter(o => allowed.has(o.id));
  }, [availableModes, deliveryModeOptions, knownModeIds]);

  return (
    <SelectOptionModal
      visible={visible}
      onClose={onClose}
      onConfirm={selectedId => onConfirm(selectedId as DeliveryMode)}
      title={t('category.selectDeliveryMode')}
      options={options}
      selectedValue={selectedMode}
      selectionType="radio"
    />
  );
}
