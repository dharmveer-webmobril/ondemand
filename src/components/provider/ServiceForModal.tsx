import React from 'react';
import SelectOptionModal, { OptionItem } from '@components/common/SelectOptionModal';

type ServiceFor = 'self' | 'other';

type ServiceForModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (serviceFor: ServiceFor) => void;
  selectedServiceFor?: ServiceFor;
};

// Options data - only three pieces of data that change
const serviceForOptions: OptionItem[] = [
  { id: 'self', label: 'Self', icon: 'person', iconType: 'Ionicons' },
  { id: 'other', label: 'Other', icon: 'people', iconType: 'Ionicons' },
];

export default function ServiceForModal({
  visible,
  onClose,
  onConfirm,
  selectedServiceFor = 'self',
}: ServiceForModalProps) {
  return (
    <SelectOptionModal
      visible={visible}
      onClose={onClose}
      onConfirm={(selectedId) => onConfirm(selectedId as ServiceFor)}
      title="Select Service For"
      options={serviceForOptions}
      selectedValue={selectedServiceFor}
      showCloseButton={true}
      selectionType="radio"
    />
  );
}
