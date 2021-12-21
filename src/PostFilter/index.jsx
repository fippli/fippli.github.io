import React from 'react';
import AppState from '../store/AppState';

const PostFilter = () => (
  <AppState.Consumer>
    {state => (
      <input
        style={styles.wrapper}
        placeholder="Filter blogposts"
        onChange={state.updateOnEvent(state, 'postFilter')}
      />
    )}
  </AppState.Consumer>
);

export default PostFilter;

const styles = {
  wrapper: {
    border: 'none',
    borderBottom: '3px solid var(--red)',
    fontWeight: 700,
    flex: 2,
    fontSize: '2rem',
    color: 'var(--blue)',
  },
};