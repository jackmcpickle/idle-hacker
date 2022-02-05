module.exports = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            animation: {
                wiggle: 'wiggle 1s ease-in-out infinite',
                progress: 'progress-bar-stripes 0.75s linear infinite',
            },
            keyframes: {
                wiggle: {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                },
                'progress-bar-stripes': {
                    from: { backgroundPosition: '1rem 0' },
                    to: { backgroundPosition: '0 0' },
                },
            },
        },
    },
    plugins: [require('@tailwindcss/forms')],
};
