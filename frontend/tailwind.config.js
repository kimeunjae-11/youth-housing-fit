import forms from '@tailwindcss/forms'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── 톤 B (2026-11-27 확정, 디자인 캔버스 '확정안' 기준) ──
        // 기존 토큰은 화면을 옮기는 동안 그대로 두고, 새 화면은 fit-* 만 쓴다. 다 옮기면 기존 토큰을 지운다.
        fit: {
          bg: '#F7F2EA', // 페이지 바탕
          card: '#FFFFFF', // 카드
          ink: '#2E221C', // 본문·제목 글자, 푸터 바탕
          muted: '#6B5B4F', // 보조 글자
          amber: '#B5581C', // 주요 버튼 (흰 글자). 화면마다 채운 요소는 하나만
          deep: '#8A4A1E', // 강조 글자, '확인 필요'
          champagne: '#F1E6D2', // 연한 강조 바탕, 선택 상태
          line: '#EDE3D3', // 표 구분선
          line2: '#E8DDCB', // 카드 테두리
          border: '#DCCFB9', // 입력창 테두리
          ok: '#4F6B3A', // '충족'
          mocha: '#5A4033', // 로고, 점수 숫자, 노을 이미지 건물
        },
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
        // 메인 화면 고정 패널과 그 위 카드의 윤곽선 (피치 계열)
        stage: {
          DEFAULT: '#F8D3C1',
          line: '#E9B9A3',
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
        listing: '0 6px 20px rgba(160,100,70,0.05)',
        'listing-hover': '0 8px 26px rgba(160,100,70,0.08)',
      },
      fontFamily: {
        // 제목·순위 숫자. index.html 에서 Noto Serif KR 500·600 을 불러온다
        serif: ['"Noto Serif KR"', 'serif'],
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
