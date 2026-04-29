/** Shared theme (aligned with frontend/tailwind.config.js) */
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Segoe UI"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
        'card-lg': '0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
      },
    },
  },
};
