import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../services/AuthContext';
import { CustomerAuthPage } from './CustomerAuthPage';

vi.mock('../../services/auth', () => {
  const customer = { id: 'customer-test', name: 'Pelanggan Tes', email: 'pelanggan@example.test', phone: '081234567890', role: 'customer' };
  return {
    authService: {
      login: vi.fn(async () => customer),
      register: vi.fn(async ({ email, name, phone }: { email: string; name: string; phone: string }) => ({ id: 'customer-registered', name, email, phone, role: 'customer' })),
      logout: vi.fn(async () => undefined),
      getCurrentUser: vi.fn(async () => null),
      onAuthStateChange: vi.fn(() => () => undefined),
    },
  };
});

function renderAuthPage(path: '/login' | '/daftar') {
  return render(<MemoryRouter initialEntries={[path]}><AuthProvider><Routes>
    <Route path="/login" element={<CustomerAuthPage />} />
    <Route path="/daftar" element={<CustomerAuthPage />} />
    <Route path="/pesan" element={<h1>Form pesan siap</h1>} />
  </Routes></AuthProvider></MemoryRouter>);
}

describe('CustomerAuthPage', () => {
  afterEach(cleanup);

  it('mengisi dan mengirim formulir daftar dengan nilai valid', async () => {
    const user = userEvent.setup();
    renderAuthPage('/daftar');

    await user.type(screen.getByRole('textbox', { name: 'Nama lengkap' }), 'Nadia Laundry');
    await user.type(screen.getByRole('textbox', { name: 'Nomor WhatsApp' }), '081234567890');
    await user.type(screen.getByRole('textbox', { name: 'Email' }), `nadia-${Date.now()}@demo.test`);
    await user.type(screen.getByLabelText('Kata sandi'), 'SangatAman123');
    await user.click(screen.getByRole('button', { name: 'Daftar' }));

    expect(await screen.findByRole('heading', { name: 'Form pesan siap' })).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('mengisi dan mengirim formulir login dengan akun pelanggan valid', async () => {
    const user = userEvent.setup();
    renderAuthPage('/login');

    await user.type(screen.getByRole('textbox', { name: 'Email' }), 'pelanggan@example.test');
    await user.type(screen.getByLabelText('Kata sandi'), 'pelanggan123');
    await user.click(screen.getByRole('button', { name: 'Masuk' }));

    expect(await screen.findByRole('heading', { name: 'Form pesan siap' })).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
