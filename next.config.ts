import createNextIntlPlugin from 'next-intl/plugin';
import type {NextConfig} from 'next';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Use the Node.js build of @walletconnect/keyvaluestorage on the server
      config.resolve.alias["@walletconnect/keyvaluestorage"] = require.resolve(
        "@walletconnect/keyvaluestorage/dist/index.cjs.js"
      );
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
