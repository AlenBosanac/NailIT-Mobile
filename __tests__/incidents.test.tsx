/// <reference types="jest" />
import { render } from '@testing-library/react-native';
import React from 'react';
import IncidentsScreen from '../app/(tabs)/incidents';

describe('Incidents Screen', () => {
  it('prikazuje ekran za incidente', async () => {
    const { findByText } = await render(<IncidentsScreen />);
    expect(await findByText('Incidents')).toBeTruthy();
  });
});