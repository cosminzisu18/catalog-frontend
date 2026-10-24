'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import { Modal } from '@/components/ui/Modal';

export function ForcePasswordModal() {
  const { user, logout } = useAuth();
  const open = !!user?.mustChangePassword;

  return (
    <Modal
      open={open}
      title="Schimba parola obligatoriu"
      subtitle="Ai o parola temporara. Trebuie sa o schimbi acum ca sa poti folosi catalogul. Nu poti inchide acest pas."
      dismissible={false}
    >
      <ChangePasswordForm embedded forced />
      <button
        type="button"
        onClick={() => void logout()}
        className="mt-3 w-full text-center text-sm font-medium text-[var(--color-muted)] hover:underline"
      >
        Iesi din cont
      </button>
    </Modal>
  );
}
