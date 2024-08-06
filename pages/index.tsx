import React from 'react';
import ColorMatcher from '@/components/ColorMatcher';
import styles from '../styles/page.module.css';

const HomePage = () => {
  return (
    <div className={styles.container}>
      <ColorMatcher />
    </div>
  );
};

export default HomePage;
