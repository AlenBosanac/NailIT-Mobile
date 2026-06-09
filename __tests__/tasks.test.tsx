/// <reference types="jest" />
import { render } from '@testing-library/react-native';
import React from 'react';
import TasksScreen from '../app/(tabs)/tasks';

describe('Tasks Screen', () => {
  it('prikazuje naslov My Tasks', async () => {
    const { findByText } = await render(<TasksScreen />);
    expect(await findByText(/my tasks/i)).toBeTruthy();
  });
});