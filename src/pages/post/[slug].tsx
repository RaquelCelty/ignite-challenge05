/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable react/no-danger */
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { redirect } from 'next/dist/next-server/server/api-utils';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    uid: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  return (
    <>
      <Header />
      <main className={styles.container}>
        <img src={post.data.banner.url} alt="banner" />
        <article className={styles.post}>
          <h1>{post.data.title}</h1>
          <div className={styles.postDetails}>
            <FiCalendar size="20px" />
            <time>
              {format(new Date(post.first_publication_date), 'd MMM yyyy', {
                locale: ptBR,
              })}
            </time>
            <FiUser size="20px" /> <span>{post.data.author}</span>
            <FiClock size="20px" /> <span>4 min</span>
          </div>
          {post.data.content.map(content => (
            <div>
              <h2>{content.heading}</h2>
              <div
                className={styles.postContent}
                dangerouslySetInnerHTML={{
                  __html: String(RichText.asHtml(content.body)),
                }}
              />
            </div>
          ))}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: { uid: 'server-side-rendering-ssr-com-reactjs-e-next.js' } },
    ],
    fallback: true,
  };
  // const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);

  // TODO
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const { data } = response;

  const postResponse = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: data.title,
      subtitle: data.subtitle,
      banner: {
        url: data.image?.url ? data.image?.url : data.banner.url,
      },
      author: data.author,
    },
  };

  const contents = data.content.map(content => {
    return {
      heading: content.heading,
      body: content.body,
    };
  });

  const postDataContent = { ...postResponse.data, content: contents };
  const post = { ...postResponse, data: postDataContent };

  return {
    props: { post },
    redirect: 60 * 1,
  };
};
