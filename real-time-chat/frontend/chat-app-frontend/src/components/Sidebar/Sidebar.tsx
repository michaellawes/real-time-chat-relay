import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog } from '@material-ui/core';

import SnackBarContent from '../SnackBar/SnackBarContent';
import PrivateMessageUserList from './PrivateMessageUserList';
import ChannelList from './ChannelList';
import ServerList from './ServerList';
import ActionsModal from '../ActionsModal/ActionsModal';
import { refreshData } from '../../actions';
import { StoreState } from '../../reducers';


interface SidebarProps {
  setDrawerVisible?: (drawerVisible: boolean) => void;
}

const Sidebar = (props: SidebarProps) => {
  // Get from Redux Store
  const user = useSelector((state: StoreState) => state.user);
  const { activeView, activeServer } = useSelector((state: StoreState) => state.chat);
  const dispatch = useDispatch();

  // Get props from parent (Used when Sidebar is rendered by header on mobile)
  const { setDrawerVisible } = props;

  // Local state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState('');
  const [snackContent, setSnackContent] = useState('');
  const [snackVisible, setSnackVisible] = useState(false);

  // Closes Modal and show Snackbar with Create / Join Messsage
  const handleSnackMessage = (response: string, pass: boolean) => {
    if (response !== null) {
      setModalVisible(false);
      setSnackVisible(true);
      setSnackContent(response);
      if (pass) dispatch(refreshData(user.username, activeServer));
    }
  };
  

  return (
    <div className="sidebar-container">
      <ServerList setModalVisible={setModalVisible} setModalType={setModalType} />
      {activeView === 'servers' ? (
        <ChannelList
          setDrawerVisible={setDrawerVisible}
          setModalVisible={setModalVisible}
          setModalType={setModalType}
          handleSnackMessage={handleSnackMessage}
        />
      ) : (
        <PrivateMessageUserList />
      )}
      <Dialog
        open={modalVisible}
        aria-labelledby="server create modal"
        aria-describedby="create a server"
        className="modal-wrapper"
        onClose={() => setModalVisible(false)}
      >
        <ActionsModal handleSnackMessage={handleSnackMessage} modalType={modalType} />
      </Dialog>
      <SnackBarContent visible={snackVisible} setVisible={setSnackVisible} content={snackContent} />
    </div>
  );
}

export default Sidebar;