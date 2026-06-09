/// <reference types="jest" />
import { render } from '@testing-library/react-native';
import React from 'react';
import LoginScreen from '../app/(auth)/login';

describe('Login Screen', () => {
  it('prikazuje login formu', async () => {
  const { getAllByText } = await render(<LoginScreen />);
  expect(getAllByText(/login/i).length).toBeGreaterThan(0);
});

  it('prikazuje Nail IT naslov', async () => {
    const { getByText } = await render(<LoginScreen />);
    expect(getByText(/nail it/i)).toBeTruthy();
  });
});