import { GatsbyImage } from 'gatsby-plugin-image';
import { styled } from '~/stitches.config';

export const Header = styled('header', {
  margin: '1rem auto',
});

export const Title = styled('h2', {
  fontSize: '1.5rem',
  width: '488px',
  height: '60px',
  lineHeight: '30px',

  display: '-webkit-box',
  '-webkit-line-clamp': 2,
  '-webkit-box-orient': 'vertical',

  overflow: 'hidden',
  textOverflow: 'ellipsis',

  transition: ".3s ease",

  'a': {
    color: '$text500',
    transition: 'color $transitionDuration $transitionTiming',
  },
});

export const Section = styled('section', {
  marginBottom: '3rem',

  color: '$text200',

  transition: 'color $transitionDuration $transitionTiming',
});

export const Thumbnail = styled(GatsbyImage, {
  width: '240px',
  height: '180px',
  marginRight: '40px',
  borderRadius: '15px',
  transition: ".3s ease",
})

export const Wrapper = styled('div', {
  width: '100%',
  height: '100%',
  display: 'flex',
  margin: '0px 0px 40px 0px',

  '&:hover .gatsby-image-wrapper': {
    transform: 'translateY(-3%)',
    boxShadow: '1px 3px 8px rgba(0, 0, 0, 0.17)'
  },

  '&:hover header h2': {
    color: '$titleHoverColor',
  }
})

export const ContentWrapper = styled('div', {
  width: '488px',
  height: '100%'
})

export const Date = styled('div', {
  width: '100%',
  height: '30px',
  color: '$text200',
})