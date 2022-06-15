import Link from 'next/link';
import styles from './MainNav.module.scss';
import ModeChangeBtn from './ModeChageBtn';

const MainNav = () => {
  return (
    <nav className={styles.nav}>
      <div className={styles.innerNav}>
        <div className={styles.logo}>
          <Link href='/'>
            <a>큰거온다</a>
          </Link>
        </div>
        <div className={styles.btns}>
          <ModeChangeBtn />
          <button className={styles['new-post-btn']}>New</button>
        </div>
      </div>
    </nav>
  );
};

export default MainNav;