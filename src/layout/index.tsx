import type { PageProps } from 'gatsby';
import React, { ComponentProps } from 'react';

import Footer from '~/components/Footer';
import Header from '~/components/Header';
// import { useDarkMode } from '~/hooks/useDarkMode';

import { Container, globalStyles, HomeContainer, Root } from './styles';

type Props = React.PropsWithChildren<Pick<PageProps, 'location'>> & ComponentProps<typeof Header>;

const Layout = ({ title, children, resetFilter, location }: Props) => {
  // const [isDarkMode, ] = useDarkMode();
  globalStyles('light');

  const currentLocation = location.pathname

  return (
    <Root>
      <Container>
        <Header title={title} resetFilter={resetFilter} />
        <main>{children}</main>
        <br/>
        <Footer />
      </Container>
    </Root>
  );

  // if (currentLocation === "/") {
  //   return (
  //     <Root>
  //       <HomeContainer>
  //         <Header title={title} resetFilter={resetFilter} />
  //         <main>{children}</main>
  //         <br/>
  //         <Footer />
  //       </HomeContainer>
  //     </Root>
  //   );
  // } else {
  //   return (
  //     <Root>
  //       <Container>
  //         <Header title={title} resetFilter={resetFilter} />
  //         <main>{children}</main>
  //         <br/>
  //         <Footer />
  //       </Container>
  //     </Root>
  //   );
  // }
};

export default Layout;
