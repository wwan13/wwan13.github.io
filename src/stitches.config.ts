import { createStitches } from '@stitches/react';

export const { styled, css, getCssText, createTheme, globalCss } = createStitches({
  prefix: '',
  theme: {
    colors: {
      gray100: '#f6f6f6',
      gray200: '#ddd',
      gray300: '#a0aec0',
      gray400: '#68768a',
      gray500: '#495467',
      gray600: '#2d3748',
      gray700: '#1a202c',
      white: '#fff',
      black: '#000',
      yellow: '#ffd75e',
      yellowAccent: '#ffa659',

      primary100: '#edfeafc',
      primary200: '#AFD198',
      primary300: '#816eec',
      primary400: '#698474',
      primary500: '#FCF8F3',

      text100: '$gray300',
      text200: '$gray400',
      text300: '$gray500',
      text400: '$gray600',
      text500: '$gray700',

      backgroundColor: '$white',

      borderGray: '$gray200',
      borderPrimary: '$primary200',

      // inlineCodeBackground: '#404040',
      inlineCodeBackground: '#F5EFE6',
      inlineCodeColor: '#698474',
      link: '$primary400',

      titleFilterBackground: '$gray100',
      tagColor: '$primary400',
      tagFilterBackground: '$primary100',

      headerCircleColor: '$primary200',

      themeSwitchBackground: '$gray500',

      titleHoverColor: '#6B8A7A',
    },
    sizes: {
      contentWidth: '43.75rem',
    },
    shadows: {
      themeSymbol: '$colors$gray400',
    },
    transitions: {
      transitionDuration: '0.2s',
      transitionTiming: 'ease-in',
      switchTransitionDuration: '0.1s',
    },
  },
  media: {
    md: '(min-width: 48em)',
  },
});


export const darkTheme = createTheme('dark-theme', {
  colors: {
    gray100: '#f6f6f6',
      gray200: '#ddd',
      gray300: '#a0aec0',
      gray400: '#68768a',
      gray500: '#495467',
      gray600: '#2d3748',
      gray700: '#1a202c',
      white: '#fff',
      black: '#000',
      yellow: '#ffd75e',
      yellowAccent: '#ffa659',

      primary100: '#edfeafc',
      primary200: '#AFD198',
      primary300: '#816eec',
      primary400: '#698474',
      primary500: '#FCF8F3',

      text100: '$gray300',
      text200: '$gray400',
      text300: '$gray500',
      text400: '$gray600',
      text500: '$gray700',

      backgroundColor: '$white',

      borderGray: '$gray200',
      borderPrimary: '$primary200',

      // inlineCodeBackground: '#404040',
      inlineCodeBackground: '#F5EFE6',
      inlineCodeColor: '#698474',
      link: '$primary400',

      titleFilterBackground: '$gray100',
      tagColor: '$primary400',
      tagFilterBackground: '$primary100',

      headerCircleColor: '$primary200',

      themeSwitchBackground: '$gray500',

      titleHoverColor: '#6B8A7A',
  },
});
