const ENV = {
  dev: {
    API_URL: 'https://warcprender.onrender.com',
  },
  prod: {
    API_URL: 'https://warcprender.onrender.com',
  },
};

const getEnvVars = (env = process.env.NODE_ENV) => {
  return env === 'production' ? ENV.prod : ENV.dev;
};

export default getEnvVars();
