/**
 * Важно для React Context между host и remote: один runtime React + ранний eager,
 * иначе remote может подтянуть второй экземпляр → useContext(Auth) === null.
 */
module.exports = {
  react: {
    singleton: true,
    eager: true,
    strictVersion: false,
    requiredVersion: '^18.0.0',
  },
  'react-dom': {
    singleton: true,
    eager: true,
    strictVersion: false,
    requiredVersion: '^18.0.0',
  },
  'react/jsx-runtime': {
    singleton: true,
    eager: true,
    strictVersion: false,
    requiredVersion: '^18.0.0',
  },
  'react/jsx-dev-runtime': {
    singleton: true,
    eager: true,
    strictVersion: false,
    requiredVersion: '^18.0.0',
  },
  'react-router-dom': { singleton: true, strictVersion: false, requiredVersion: '^6.0.0' },
  mobx: { singleton: true, strictVersion: false, requiredVersion: '^6.0.0' },
  'mobx-react-lite': { singleton: true, strictVersion: false, requiredVersion: '^4.0.0' },
  axios: { singleton: true, strictVersion: false },
};
