import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AddCircleOutline, AlbumRounded } from '@material-ui/icons';
import { List, Tooltip, IconButton, Avatar } from '@material-ui/core';
import { changeServer, changeView } from '../../actions';
import { StoreState } from '../../reducers';


interface ServerListProps {
  setModalVisible: (modalVisible: boolean) => void;
  setModalType: (modalType: string) => void;
}

const ServerList = (props: ServerListProps) => {
  // Get state from Redux Store
  const chatStore = useSelector((state: StoreState) => state.chat);
  const user = useSelector((state: StoreState) => state.user);
  const dispatch = useDispatch();

  // If no servers have been joined use an empty array
  let servers = Object.keys(chatStore.servers);
  if(servers === undefined) {
    servers = [];
  }

  // Get props from parent
  const { setModalVisible, setModalType } = props;

  // Handles server change, and closes drawer if on mobile view
  const handleServerChange = (server: string) => {
    dispatch(changeServer(server, user.username));
  }

  // Handles to show modal and its type
  const handleModalShow = () => {
    setModalType('server-create-join');
    setModalVisible(true);
  }

  // Handles changing the view and calls callback function
  const handleChangeView = (view: string, callBack?: Function) => {
    dispatch(changeView(view));
    if (callBack !== undefined) callBack();
  }

  return (
    <div className="servers-container">
      <List>
        <div className="home-icon-wrapper">
          <Tooltip title="Home" key="home" placement="right" className="tooltip">
            <Avatar src={'http://localhost:3000/thndrlogo.png'} className="home-icon" onClick={() => handleChangeView('home')}/>
          </Tooltip>
        </div>
        <div className="menu-seperator" />
        {servers.map(server => (
          <Tooltip title={server.split('/', 2)[1]} key={server} placement="right" className="tooltip">
            <IconButton
              className="server-icon"
              onClick={() => handleChangeView('servers', () => handleServerChange(server))}
            >
              <AlbumRounded />
            </IconButton> 
          </Tooltip>
        ))}

        <Tooltip title="Create Server" key="create-server" placement="right" className="tooltip">
          <IconButton className="server-icon" onClick={() => handleChangeView('servers', () => handleModalShow())}>
            <AddCircleOutline />
          </IconButton>
        </Tooltip>
      </List>
    </div>
  );
}

export default ServerList;