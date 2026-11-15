import { useEffect, useId, useRef } from 'react';
import { Button, type ButtonVariant } from './Button';
import { Card } from './Card';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  confirmVariant?: ButtonVariant;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    cancelButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[var(--orvex-surface-overlay)] p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <Card
        padding="lg"
        className="w-full sm:max-w-md rounded-t-[var(--orvex-radius-sheet)] sm:rounded-[var(--orvex-radius-card)] shadow-[var(--orvex-shadow-dialog)] space-y-5"
      >
        <div className="space-y-1.5">
          <h2 id={titleId} className="text-lg font-bold text-[var(--orvex-text-primary)]">
            {title}
          </h2>
          <p id={descriptionId} className="text-sm text-[var(--orvex-text-secondary)] leading-relaxed">
            {description}
          </p>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">
          <Button
            ref={cancelButtonRef}
            variant="outline"
            onClick={onCancel}
            className="sm:min-w-[100px]"
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            className="sm:min-w-[120px]"
          >
            {confirmLabel}
          </Button>
        </div>
      </Card>
    </div>
  );
}
