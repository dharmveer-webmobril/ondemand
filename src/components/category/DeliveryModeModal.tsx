import { useMemo } from 'react';
import SelectOptionModal, { OptionItem } from '@components/common/SelectOptionModal';

type DeliveryMode = 'atHome' | 'online' | 'onPremises' | null;

const deliveryModeOptions: OptionItem[] = [
  { id: 'atHome', label: 'At Home', icon: 'home', iconType: 'MaterialIcons' },
  { id: 'online', label: 'Online', icon: 'laptop', iconType: 'MaterialIcons' },
  { id: 'onPremises', label: 'On Premises', icon: 'storefront', iconType: 'MaterialIcons' },
];

const KNOWN_MODE_IDS = new Set(deliveryModeOptions.map((o) => o.id));

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
  const options = useMemo(() => {
    if (availableModes === undefined) {
      return deliveryModeOptions;
    }
    const allowed = new Set(
      availableModes.filter((id) => KNOWN_MODE_IDS.has(id)),
    );
    return deliveryModeOptions.filter((o) => allowed.has(o.id));
  }, [availableModes]);

  return (
    <SelectOptionModal
      visible={visible}
      onClose={onClose}
      onConfirm={(selectedId) => onConfirm(selectedId as DeliveryMode)}
      title="Select Delivery Mode"
      options={options}
      selectedValue={selectedMode}
      selectionType="radio"
    />
  );
}

