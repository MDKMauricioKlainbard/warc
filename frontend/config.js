const ENV = {
  dev: {
    API_URL: 'http://10.0.2.2:3000',
  },
  prod: {
    API_URL: 'http://10.0.2.2:3000',
  },
};

const getEnvVars = (env = process.env.NODE_ENV) => {
  return env === 'production' ? ENV.prod : ENV.dev;
};

export default getEnvVars();
