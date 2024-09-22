import { Link } from 'gatsby';
import { IGatsbyImageData } from 'gatsby-plugin-image';
import React, { memo } from 'react';

import { Header, Section, Title, Thumbnail, Wrapper, ContentWrapper, Date } from './styles';

interface Props {
  slug: string;
  title: string;
  description: string;
  date: String;
  thumbnail: any;
}

const ArticleListItem = ({ slug, title, description, date, thumbnail }: Props) => (
  <li key={slug}>
    <br/>
    <article
      className='post-list-item'
      itemScope
      itemType='http://schema.org/Article'
    >
      <Link to={slug} itemProp='url'>
        <Wrapper>
          <Thumbnail image={thumbnail} alt="Thumbnail" />
          <ContentWrapper>
            <div>
            <Header>
              <Title>
                <span itemProp='headline'>{title}</span>
              </Title>
            </Header>
            <Section>
              <p
                dangerouslySetInnerHTML={{
                  __html: description,
                }}
                itemProp='description'
              />
            </Section>
            </div>
            <Date>{date.split('T')[0]} · 김태완</Date>
            </ContentWrapper>
        </Wrapper>
      </Link>
    </article>
  </li>
);

export default memo(ArticleListItem);
