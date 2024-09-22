import { GatsbyImage } from 'gatsby-plugin-image';
import { styled } from '~/stitches.config';

export const Header = styled('header', {
  margin: '5px auto 0px auto',
});

export const Title = styled('h2', {
  fontSize: '1.4rem',
  width: '520px',
  height: 'auto',

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
  // marginBottom: '20px',
  // marginBottom: '0px',
  width: '520px',
  height: 'auto',
  color: '$text200',
  transition: 'color $transitionDuration $transitionTiming',

  display: '-webkit-box',
  '-webkit-line-clamp': 1,
  '-webkit-box-orient': 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

export const Thumbnail = styled(GatsbyImage, {
  width: '200px',
  height: '150px',
  marginRight: '40px',
  borderRadius: '15px',
  transition: ".3s ease",
})

export const Wrapper = styled('div', {
  width: '100%',
  height: '100%',
  display: 'flex',
  alignContent: 'spaceBetween',
  margin: '0px 0px 45px 0px',

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
  height: '150px',
  display: 'flex',
  flexDirection: "column", 
  justifyContent: "space-between",
  // margin: 'auto 0px auto 0px'
})

export const Date = styled('div', {
  width: '100%',
  height: '30px',
  color: '$text200',
})