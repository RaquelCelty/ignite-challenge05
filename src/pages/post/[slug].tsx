/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import Prismic from '@prismicio/client';
import Link from 'next/link';
import { useRouter } from 'next/router';
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
  preview: boolean;
}

export default function Post({ post, preview }: PostProps) {
  const router = useRouter();

  const estimateReadingTime = post.data.content.reduce((acc, cur) => {
    const totalWordsBody = RichText.asText(cur.body).split(/\s+/).length;
    const totalWordsHead = cur.heading ? cur.heading.length : 0;

    const totalWords = totalWordsBody + totalWordsHead;

    return Math.ceil(acc + totalWords / 200);
  }, 0);

  return (
    <>
      <Header page="slug" />
      <main className={styles.container}>
        {router.isFallback ? (
          <div>Carregando...</div>
        ) : (
          <>
            <img src={post.data.banner.url} alt="banner" />
            <article className={styles.post}>
              <h1>{post.data.title}</h1>
              <div className={commonStyles.postDetails}>
                <FiCalendar size="20px" />
                <time>
                  {format(new Date(post.first_publication_date), 'd MMM yyyy', {
                    locale: ptBR,
                  })}
                </time>
                <FiUser size="20px" /> <span>{post.data.author}</span>
                <FiClock size="20px" /> <span>{estimateReadingTime} min</span>
              </div>
              {post.data.content.map(content => (
                <div
                  key={
                    content.heading
                      ? content.heading.charAt(
                        Math.floor(Math.random() * content.heading?.length)
                      )
                      : Math.floor(Math.random())
                  }
                >
                  <h2>{content.heading}</h2>
                  <div
                    className={styles.postContent}
                    // eslint-disable-next-line react/no-danger
                    dangerouslySetInnerHTML={{
                      __html: String(RichText.asHtml(content.body)),
                    }}
                  />
                </div>
              ))}
            </article>
          </>
        )}

        {preview && (
          <aside className={commonStyles.btnExitPreviewMode}>
            <Link href="/api/exit-preview">
              <a>Sair do modo Preview</a>
            </Link>
          </aside>
        )}
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params, preview = false, previewData }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), { ref: previewData?.ref ?? null });

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
    props: { post, preview },
    redirect: 60 * 1,
  };
};
