import React, { useEffect, useCallback, useState } from 'react';
import { loadUserData, updateActiveState, refreshData, updateActiveUserList, updateUnactiveUserList } from '../../actions';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from '@material-ui/core';

import createHashHistory from '../../history';
import Sidebar from '../Sidebar/Sidebar';
import SendMessage from '../SendMessage/SendMessage';
import Header from '../Header/Header';
import Messages from '../Messages/Messages';
import ActiveUserList from '../ActiveUserList/ActiveUserList';
import ActionsModal from '../ActionsModal/ActionsModal';
import SnackBarContent from '../SnackBar/SnackBarContent';
import { StoreState } from '../../reducers';

const Dashboard = () => {
  // Get state from Redux Store
  const user = useSelector((state: StoreState) => state.user);
  const { activeRoom } = useSelector((state: StoreState) => state.chat);
  const dispatch = useDispatch();

  // Local state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [snackContent, setSnackContent] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);

  // Updates active user list
  const activeStatusWrapper = useCallback(() => {
    const updateActiveStatus = () => {
      dispatch(updateActiveState());
      if(activeRoom !== '') {
        dispatch(updateActiveUserList(activeRoom.split('/', 2)[0]));
        dispatch(updateUnactiveUserList(activeRoom.split('/', 2)[0]));
      } 
      setTimeout(updateActiveStatus, 5 * 60000);
    };
    updateActiveStatus();
  }, [activeRoom, dispatch]);

  // Listens for changes on isSignedIn
  useEffect(() => {
    if (!user.isSignedIn) {
      createHashHistory.push('/');
    } else {
      dispatch(loadUserData(user.username));
    } 
  }, [user.isSignedIn, user.username, dispatch]);

  // Ping server every 5 minutes to update our active status
  useEffect(() => {
    if(user.isSignedIn) {
      activeStatusWrapper();
    }
  }, [activeStatusWrapper, user.isSignedIn]);

  // Handle message for actions modal
  const handleSnackMessage = (response: string, pass: boolean) => {
    if (response !== null) {
      setModalVisible(false);
      setSnackVisible(true);
      setSnackContent(response);
      if (pass) dispatch(refreshData(user.username, activeRoom));
    }
  };

  // Watches viewport height (fix for movile address bar size)
  window.addEventListener('resize', () => {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  });

  return (
    <div className="dashboard">
      <div className="grid-container">
        <div className="sidebar-grid">
          <Sidebar />
        </div>

        <div className="messages-grid">
          <Header />
          <Messages 
            setModalVisible={setModalVisible}
            setModalType={setModalType}
          />
          <Dialog
            open={modalVisible}
            aria-labelledby="message delete modal"
            aria-describedby="delete a message"
            className="modal-wrapper"
            onClose={() => setModalVisible(false)}
          >
            <ActionsModal handleSnackMessage={handleSnackMessage} modalType={modalType} />
          </Dialog>
          <SnackBarContent visible={snackVisible} setVisible={setSnackVisible} content={snackContent} />
        </div>
 
        <div className="user-list-grid">
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
        </div>

        <div className="send-messages-grid">
          <SendMessage />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;