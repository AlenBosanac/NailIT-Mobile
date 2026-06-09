/// <reference types="jest" />
import { render } from '@testing-library/react-native';
import React from 'react';
import AttendanceScreen from '../app/(tabs)/attendance';

describe('Attendance Screen', () => {
  it('prikazuje Attendance ekran', async () => {
    const { findByText } = await render(<AttendanceScreen />);
    expect(await findByText(/attendance/i)).toBeTruthy();
  });
});