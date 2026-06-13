const jobnewsindiaConfig = require('./niches/jobnewsindia.config');

const configs = {
  jobnewsindia: jobnewsindiaConfig,
};

function getSiteConfig() {
  const niche = process.env.NICHE || 'jobnewsindia';
  const config = configs[niche];
  if (!config) {
    console.warn(`No config found for niche: ${niche}, falling back to jobnewsindia`);
    return jobnewsindiaConfig;
  }
  return config;
}

module.exports = { getSiteConfig };
