export default {
    plugins: {
        'postcss-import': {},
        'tailwindcss/nesting': {},
        tailwindcss: {},
        autoprefixer: {},
        ...(process.env.NODE_ENV === 'production'
            ? {
                cssnano: {
                    preset: [
                        'default',
                        {
                            discardComments: { removeAll: true },
                            normalizeWhitespace: false,
                            mergeLonghand: false,
                            colormin: false,
                            normalizeUnicode: false,
                            svgo: {
                                plugins: [
                                    {
                                        name: 'preset-default',
                                        params: {
                                            overrides: {
                                                removeViewBox: false,
                                            },
                                        },
                                    },
                                ],
                            },
                        }
                    ]
                }
            }
            : {})
    }
}