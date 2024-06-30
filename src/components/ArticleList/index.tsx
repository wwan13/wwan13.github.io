import React, { memo } from 'react';

import ArticleListItem from '~/components/ArticleList/Item';

import { Container } from './styles';

import { getImage } from "gatsby-plugin-image"

interface Props {
  posts: GatsbyTypes.BlogIndexQuery['allMarkdownRemark']['nodes'],
}

const ArticleList = ({ posts }: Props) => {
  return (
    <Container>
      {posts.map(post => {
        if (post === undefined) {
          return null;
        }

        const title = post.frontmatter?.title ?? post.fields?.slug ?? '';
        const slug = post.fields?.slug ?? '';
        const description = post.frontmatter?.description ?? '';
        const date = post.frontmatter?.date ?? "";
        const thumbnail = getImage(post.frontmatter?.thumbnail?.childImageSharp?.gatsbyImageData)

        return (
          <ArticleListItem
            key={slug}
            title={title}
            slug={slug}
            description={description}
            date={date}
            thumbnail={thumbnail}
          />
        );
      })}
    </Container>
  );
};

export default memo(ArticleList);
