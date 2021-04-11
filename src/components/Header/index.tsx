import Link from 'next/link';

import styles from './header.module.scss';

/* eslint-disable @typescript-eslint/explicit-function-return-type */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function Header() {
  return (
    <header className={styles.header}>
      <Link href="/">
        <a>
          <img src="../Logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  );
}
