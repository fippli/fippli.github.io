import React from 'react';

const Tag = ({ tag }) => (
  <div style={styles.tag}>{tag}</div>
);

export default Tag;

const styles = {
  tag: {
    backgroundColor: 'var(--blue)',
    borderRadius: '100px',
    padding: '3px 10px',
    color: '#ffffff',
    fontWeight: 900,
    marginRight: '10px',
    fontSize: '0.8rem',
  },
};