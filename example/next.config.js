/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: [
    '@modori-labs/zk-noir-fetch',
    '@reclaimprotocol/attestor-core', 
    'zk-symmetric-crypto-test',
    'koffi',
    're2',
    '@aztec/bb.js',
    '@noir-lang/acvm_js',
    '@noir-lang/noir_js'
  ],
  webpack: (config, { isServer }) => {
    if (isServer) {
      // For server-side, mark these as external to avoid bundling
      config.externals = [
        ...(config.externals || []),
        {
          'koffi': 'commonjs koffi',
          're2': 'commonjs re2',
          '@aztec/bb.js': 'commonjs @aztec/bb.js'
        }
      ];
    } else {
      // For client-side, provide fallbacks and externals
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
        worker_threads: false,
        crypto: false,
        stream: false,
        buffer: false,
        process: false,
        os: false,
        path: false,
        util: false,
        events: false,
        url: false,
        querystring: false,
        zlib: false,
        http: false,
        https: false,
      };
      
      // Completely exclude from client bundle
      config.externals = [
        ...(config.externals || []),
        '@modori-labs/zk-noir-fetch',
        '@reclaimprotocol/attestor-core',
        'zk-symmetric-crypto-test',
        'koffi',
        're2'
      ];
    }

    return config;
  },
};

module.exports = nextConfig;