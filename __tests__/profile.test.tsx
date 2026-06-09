/// <reference types="jest" />
import { render } from '@testing-library/react-native';
import React from 'react';
import ProfileScreen from '../app/(tabs)/profile';

describe('Profile Screen', () => {
  it('prikazuje Personal Information sekciju', async () => {
    const { findByText } = await render(<ProfileScreen />);
    expect(await findByText(/personal information/i)).toBeTruthy();
  });

  it('prikazuje logout gumb', async () => {
    const { findByText } = await render(<ProfileScreen />);
    expect(await findByText(/odjavi se/i)).toBeTruthy();
  });
});