const mockUser = {
  name: 'Ivan Horvat',
  email: 'ivan@nailit.com',
  role: 'worker',
  position: 'Radnik',
  phone: '091234567',
};

const useAuthStore = jest.fn(() => ({
  user: mockUser,
  token: 'mock-token',
  login: jest.fn(),
  logout: jest.fn(),
  isLoading: false,
}));

useAuthStore.getState = jest.fn(() => ({
  user: mockUser,
  token: 'mock-token',
}));

module.exports = { useAuthStore };