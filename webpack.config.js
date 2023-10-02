const config = {
    entry: './src/main.ts',
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                loader: 'ts-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js', '...'],
    },
};

export default (env, options) => {
    if (options.mode == 'production') {
        config.mode = 'production';
        config.optimization = { minimize: true, usedExports: false };
    } else {
        config.mode = 'development';
    }

    return config;
};
