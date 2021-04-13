import Link from 'next/link';

import styles from './header.module.scss';

interface HeaderProps {
  page: string;
}

/* eslint-disable @typescript-eslint/explicit-function-return-type */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function Header({ page }: HeaderProps) {
  return (
    <header
      className={styles.header}
      style={
        page === 'slug' ? { margin: '2rem auto' } : { margin: '5rem auto' }
      }
    >
      <Link href="/">
        <a>
          <img src="../Logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  );
}
