import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import AppBar from '@material-ui/core/AppBar';
import { Dialog } from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import { SwipeableDrawer } from '@material-ui/core';

import Sidebar from '../Sidebar/Sidebar';
import SnackBarContent from '../SnackBar/SnackBarContent';
import ActionsModal from '../ActionsModal/ActionsModal';
import ActiveUserList from '../ActiveUserList/ActiveUserList';
import { StoreState } from '../../reducers';
import { refreshData } from '../../actions';

export default function Header() {
  // Get State from Redux Store
  const chatStore = useSelector((state: StoreState) => state.chat);
  const user = useSelector((state: StoreState) => state.user);
  const { activeChannel, activePMUser, activeView, activeServer } = chatStore;
  const dispatch = useDispatch();

  // Local state
  const [sideBarDrawerVisible, setSideBarDrawerVisible] = useState(false);
  const [userListDrawerVisible, setUserListDrawerVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [snackContent, setSnackContent] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);

  // Handles message to actions modal
  const handleSnackMessage = (response: string, pass: boolean) => {
    if (response !== null) {
      setModalVisible(false);
      setSnackVisible(true);
      setSnackContent(response);
      if (pass) dispatch(refreshData(user.username, activeServer));
    }
  };

  // On active view change change title
  useEffect(() => {
    if (activeView === 'servers') {
      if(activeChannel === undefined) {
        setTitle('');
      } else {
        setTitle(activeChannel.split('/', 2)[1]);
      }
    } else if (activeView === 'home') {
      if(activePMUser === undefined) {
        setTitle('');
      } else {
        setTitle(activePMUser);
      }
    }
  }, [activeView, activePMUser, activeChannel]);

  return (
    <AppBar position="static" className="appbar">
      <Toolbar className="navbar">
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          className="menu-burger-button"
          onClick={() => setSideBarDrawerVisible(true)}
        >
          <MenuIcon />
        </IconButton>
        <SwipeableDrawer
          anchor="left"
          open={sideBarDrawerVisible}
          onClose={() => setSideBarDrawerVisible(false)}
          onOpen={() => setSideBarDrawerVisible(true)}
        >
          <Sidebar setDrawerVisible={setSideBarDrawerVisible} />
        </SwipeableDrawer>
        <SwipeableDrawer
          anchor="right"
          open={userListDrawerVisible}
          onClose={() => setUserListDrawerVisible(false)}
          onOpen={() => setUserListDrawerVisible(true)}
        >
          <ActiveUserList 
            setModalVisible={setModalVisible}
            setModalType={setModalType}
          />
          <Dialog
            open={modalVisible}
            aria-labelledby="Active User Modal"
            aria-describedby="User options"
            className="modal-wrapper"
            onClose={() => setModalVisible(false)}
          >
            <ActionsModal handleSnackMessage={handleSnackMessage} modalType={modalType} />
          </Dialog>
          <SnackBarContent visible={snackVisible} setVisible={setSnackVisible} content={snackContent} />
        </SwipeableDrawer>
        <Typography variant="h6">{title}</Typography>
      </Toolbar>
    </AppBar>
  );
}