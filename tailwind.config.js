/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      // 超大屏断点，用于导航栏回到大屏原始比例
      screens: {
        '3xl': '1920px',
        '2x5l': '1750px',
        ssm: '500px',
      },
      fontFamily: {
        myfont: ['huoxie', 'xuanzong', 'Moti', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
