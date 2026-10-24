import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { ToastProvider } from '@/components/ui/Toast';

// components use toasts for their messages, like in the app
export function renderWithToast(ui: ReactElement) {
  const user = userEvent.setup();
  return { user, ...render(<ToastProvider>{ui}</ToastProvider>) };
}
