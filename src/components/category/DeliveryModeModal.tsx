import SelectOptionModal, { OptionItem } from '@components/common/SelectOptionModal';

type DeliveryMode = 'atHome' | 'online' | 'onPremises' | null;

type DeliveryModeModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (mode: DeliveryMode) => void;
  selectedMode?: any;
};

// Options data - only three pieces of data that change
const deliveryModeOptions: OptionItem[] = [
  { id: 'atHome', label: 'At Home', icon: 'home', iconType: 'MaterialIcons' },
  { id: 'online', label: 'Online', icon: 'laptop', iconType: 'MaterialIcons' },
  { id: 'onPremises', label: 'On Premises', icon: 'storefront', iconType: 'MaterialIcons' },
];

export default function DeliveryModeModal({
  visible,
  onClose,
  onConfirm,
  selectedMode = null,
}: DeliveryModeModalProps) {
  return (
    <SelectOptionModal
      visible={visible}
      onClose={onClose}
      onConfirm={(selectedId) => onConfirm(selectedId as DeliveryMode)}
      title="Select Delivery Mode"
      options={deliveryModeOptions}
      selectedValue={selectedMode}
      selectionType="radio"
    />
  );
}

