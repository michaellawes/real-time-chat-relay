import React from 'react';
import { Snackbar } from '@material-ui/core';

// Snackbar allows you to set the content and change visibility from parent component
const SnackBarContent = (props: any) => {
  const { content, visible, setVisible } = props;

  // When opened, closes itself after 2.5sec
  const handleSnackBarOpen = () => {
    setTimeout(() => {
      setVisible(false);
    }, 2500)
  }

  return (
    <Snackbar
      open={visible}
      message={content}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left'
      }}
      className="snack-bar"
      onEntered={() => handleSnackBarOpen()}
    />
  )
};

export default SnackBarContent;