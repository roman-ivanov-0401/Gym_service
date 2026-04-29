module.exports = {
  presets: [require('../shared/tailwind-preset')],
  content: ['./src/**/*.{ts,tsx}', '../client-app/src/**/*.{ts,tsx}', '../admin-app/src/**/*.{ts,tsx}'],
  plugins: [],
};
