/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 광주은행 브랜드 컬러
        primary: {
          50: '#f0f6ff',
          100: '#d9e9ff',
          200: '#b3d4ff',
          300: '#8db8ff',
          400: '#6699ff',
          500: '#005BAC',  // 광주은행 메인 색상
          600: '#00437F',  // 호버/선택 색상
          700: '#003d8a',
          800: '#00295c',
          900: '#00142e',
        },
        // 그레이 스케일
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        // 상태 컬러
        success: {
          light: '#d1fae5',
          DEFAULT: '#10b981',
          dark: '#065f46',
        },
        warning: {
          light: '#fed7aa',
          DEFAULT: '#f59e0b',
          dark: '#92400e',
        },
        error: {
          light: '#fecaca',
          DEFAULT: '#ef4444',
          dark: '#991b1b',
        },
        info: {
          light: '#dbeafe',
          DEFAULT: '#3b82f6',
          dark: '#1e40af',
        },
        // 추가 커스텀 색상
        'brand': {
          'light': '#E8F1FB',
          'focus': '#1A73E8',
        },
        'text': {
          'primary': '#212121',
          'secondary': '#6E6E6E',
        },
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
