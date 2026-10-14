import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── 공통 토큰: Stitch 시안 3화면이 함께 쓰는 값 ──
        canvas: '#FFF9F5', // 페이지 배경
        ink: '#2B2420', // 본문·제목 글자
        muted: '#6F645D', // 보조 글자 (시안의 #5C524C / #7A706A / #7D7068 통일)
        subtle: '#8A7F78', // 메타 정보·placeholder·비활성 글자
        accent: {
          DEFAULT: '#FFA98A', // 포인트
          hover: '#FF9C7A', // 포인트 버튼 hover
          soft: '#FFF0E8', // 연한 포인트 (선택 상태, 칩 배경)
          ink: '#3A2620', // 포인트 배경 위 글자
        },
        ok: {
          DEFAULT: '#1F7A55', // 충족
          soft: '#E4F6EE', // 충족 배지 배경
        },
        line: {
          DEFAULT: '#F2E5DC', // 헤더·푸터 구분선
          soft: '#F5E8DF', // 카드 테두리
          strong: '#E8D5C8', // 입력창 테두리
        },

        // ── 03-recommend.html 이 쓰는 클래스 이름 (값은 DESIGN.md) ──
        surface: '#fff8f5',
        'surface-dim': '#e5d7d1',
        'surface-bright': '#fff8f5',
        'surface-container-lowest': '#ffffff',
        'surface-container-low': '#fff1ea',
        'surface-container': '#f9ebe5',
        'surface-container-high': '#f3e5df',
        'surface-container-highest': '#ede0d9',
        'surface-variant': '#ede0d9',
        'surface-tint': '#8f4c33',
        'on-surface': '#211a16',
        'on-surface-variant': '#53433e',
        'inverse-surface': '#362f2b',
        'inverse-on-surface': '#fceee7',
        outline: '#86736d',
        'outline-variant': '#d9c2ba',
        primary: '#8f4c33',
        'on-primary': '#ffffff',
        'primary-container': '#ffa98a',
        'on-primary-container': '#793b24',
        'inverse-primary': '#ffb59b',
        'primary-fixed': '#ffdbcf',
        'primary-fixed-dim': '#ffb59b',
        'on-primary-fixed': '#380d00',
        'on-primary-fixed-variant': '#72361e',
        secondary: '#665c56',
        'on-secondary': '#ffffff',
        'secondary-container': '#ebddd5',
        'on-secondary-container': '#6b615b',
        'secondary-fixed': '#eee0d8',
        'secondary-fixed-dim': '#d2c4bc',
        'on-secondary-fixed': '#211a16',
        'on-secondary-fixed-variant': '#4e453f',
        tertiary: '#056c48',
        'on-tertiary': '#ffffff',
        'tertiary-container': '#7acfa4',
        'on-tertiary-container': '#00583a',
        'tertiary-fixed': '#9ef4c7',
        'tertiary-fixed-dim': '#82d8ac',
        'on-tertiary-fixed': '#002113',
        'on-tertiary-fixed-variant': '#005235',
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        background: '#fff8f5',
        'on-background': '#211a16',
      },
      boxShadow: {
        card: '0 10px 30px -5px rgba(217,107,72,0.06), 0 4px 12px -2px rgba(0,0,0,0.03)',
        step: '0 4px 16px rgba(217,107,72,0.06)',
      },
      fontFamily: {
        sans: [
          'Pretendard',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [forms],
}
