'use client';

import {
  ActionIcon,
  ActionLink,
  IconDetails,
  IconEdit,
  IconPower,
  IconTrash,
} from '@/components/ui/ActionIcon';

type Props = {
  detailHref: string;
  isActive: boolean;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
};

// standard icon actions for a teacher / student row (director view)
export function PersonRowActions({
  detailHref,
  isActive,
  onEdit,
  onToggleActive,
  onDelete,
}: Props) {
  return (
    <>
      <ActionLink href={detailHref} label="Detalii">
        <IconDetails />
      </ActionLink>
      <ActionIcon label="Modifica" onClick={onEdit}>
        <IconEdit />
      </ActionIcon>
      <ActionIcon
        label={isActive ? 'Dezactiveaza' : 'Activeaza'}
        onClick={onToggleActive}
      >
        <IconPower off={!isActive} />
      </ActionIcon>
      <ActionIcon label="Sterge" variant="danger" onClick={onDelete}>
        <IconTrash />
      </ActionIcon>
    </>
  );
}
