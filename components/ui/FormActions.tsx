import { Button } from '@/components/ui/Button';

export function FormActions({
  onCancel,
  loading,
  submitLabel = 'Salveaza',
}: {
  onCancel: () => void;
  loading: boolean;
  submitLabel?: string;
}) {
  return (
    <div className="flex justify-end gap-2">
      <Button type="button" variant="ghost" onClick={onCancel}>
        Anuleaza
      </Button>
      <Button type="submit" loading={loading}>
        {submitLabel}
      </Button>
    </div>
  );
}
