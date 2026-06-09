jest.mock('react-native', () => {
  const React = require('react');

  const mockComponent = (name) => {
    const Mock = ({ children, ...props }) => React.createElement(name, props, children);
    Mock.displayName = name;
    return Mock;
  };

  return {
    Text: mockComponent('Text'),
    View: mockComponent('View'),
    TextInput: mockComponent('TextInput'),
    TouchableOpacity: mockComponent('TouchableOpacity'),
    ScrollView: mockComponent('ScrollView'),
    FlatList: ({ data = [], renderItem, ListEmptyComponent, keyExtractor, refreshControl, contentContainerStyle, ...props }) => {
  const React = require('react');
  if (!data || data.length === 0) {
    if (ListEmptyComponent) {
      return typeof ListEmptyComponent === 'function'
        ? React.createElement(ListEmptyComponent)
        : React.isValidElement(ListEmptyComponent)
          ? ListEmptyComponent
          : null;
    }
    return React.createElement('View', props);
  }
  return React.createElement(
    'View',
    props,
    data.map((item, index) =>
      renderItem({ item, index, separators: {} })
    )
  );
},
    ActivityIndicator: mockComponent('ActivityIndicator'),
    Image: mockComponent('Image'),
    Modal: ({ children, visible }) => visible ? React.createElement('View', null, children) : null,
    KeyboardAvoidingView: mockComponent('KeyboardAvoidingView'),
    SafeAreaView: mockComponent('SafeAreaView'),
    RefreshControl: mockComponent('RefreshControl'),
    StyleSheet: {
      create: (styles) => styles,
      flatten: (style) => style,
      hairlineWidth: 1,
      absoluteFillObject: {},
    },
    Platform: {
      OS: 'ios',
      select: (obj) => obj.ios ?? obj.default,
      Version: 14,
    },
    Alert: { alert: jest.fn() },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    Animated: {
      Value: jest.fn(() => ({ interpolate: jest.fn(), setValue: jest.fn() })),
      View: mockComponent('Animated.View'),
      Text: mockComponent('Animated.Text'),
      timing: jest.fn(() => ({ start: jest.fn() })),
      spring: jest.fn(() => ({ start: jest.fn() })),
      parallel: jest.fn(() => ({ start: jest.fn() })),
      sequence: jest.fn(() => ({ start: jest.fn() })),
    },
    useColorScheme: jest.fn(() => 'light'),
    useWindowDimensions: jest.fn(() => ({ width: 375, height: 812 })),
    PixelRatio: { get: jest.fn(() => 2), getFontScale: jest.fn(() => 1) },
    Keyboard: { dismiss: jest.fn(), addListener: jest.fn(), removeListener: jest.fn() },
    Pressable: mockComponent('Pressable'),
    Switch: mockComponent('Switch'),
  };
});

jest.mock('react-native-safe-area-context', () => {
  const { View } = require('react-native');
  const React = require('react');
  return {
    SafeAreaProvider: ({ children }) => React.createElement(View, null, children),
    SafeAreaView: ({ children, style }) => React.createElement(View, { style }, children),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    useSafeAreaFrame: () => ({ x: 0, y: 0, width: 375, height: 812 }),
  };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn().mockResolvedValue(null),
  setItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
  clear: jest.fn().mockResolvedValue(null),
  getAllKeys: jest.fn().mockResolvedValue([]),
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn(), back: jest.fn() },
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  Link: ({ children }) => children,
  Redirect: () => null,
  Stack: { Screen: () => null },
  Tabs: { Screen: () => null },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: { latitude: 45.815, longitude: 15.982, accuracy: 10 },
  }),
  Accuracy: { High: 4, Balanced: 3, Low: 2, Lowest: 1 },
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true }),
  launchCameraAsync: jest.fn().mockResolvedValue({ canceled: true }),
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  MediaTypeOptions: { Images: 'Images', Videos: 'Videos', All: 'All' },
}));

jest.mock('axios', () => ({
  create: jest.fn(() => ({
    get: jest.fn().mockResolvedValue({ data: [] }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    put: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  })),
}));

jest.mock('../services/profileService', () => ({
  getProfile: jest.fn().mockResolvedValue({
    fullName: 'Ivan Horvat',
    email: 'ivan@nailit.com',
    phone: '091234567',
    role: 'worker',
    skills: [],
    createdAt: '2024-01-01T00:00:00Z',
  }),
  getSchedule: jest.fn().mockResolvedValue([]),
  getSites: jest.fn().mockResolvedValue([]),
}));

jest.mock('../services/attendanceService', () => ({
  getAttendanceStatus: jest.fn().mockResolvedValue({ isCheckedIn: false, last: null }),
  checkIn: jest.fn().mockResolvedValue({ geofenceValid: true }),
  checkOut: jest.fn().mockResolvedValue({}),
}));

jest.mock('../services/taskService', () => ({
  getTasks: jest.fn().mockResolvedValue([]),
  updateTaskStatus: jest.fn().mockResolvedValue({}),
}));

jest.mock('../services/incidentService', () => ({
  getIncidents: jest.fn().mockResolvedValue([]),
  createIncident: jest.fn().mockResolvedValue({ id: '1' }),
  uploadIncidentPhoto: jest.fn().mockResolvedValue({}),
}));