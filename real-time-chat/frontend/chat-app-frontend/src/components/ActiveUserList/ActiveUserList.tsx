import React, { useState } from 'react';
import { 
  List, 
  ListItem, 
  /*ListItemAvatar, 
  Avatar,*/ 
  ListItemText, 
  Popover, 
  Tooltip, 
  IconButton,
  Menu,
  MenuItem,
} from '@material-ui/core';
import { MoreVert } from '@material-ui/icons';
import { useSelector, useDispatch } from 'react-redux';
import UserInfo from '../UserInfo/UserInfo';
import { StoreState } from '../../reducers';
import { setCurrentUser } from '../../actions';
/*
  <ListItemAvatar className="message-user-icon">
    <Avatar>
      <img src={'/user.png'} alt="user icon" height="48" />
      <div className="user-list-online"></div>
    </Avatar>
  </ListItemAvatar>
*/

interface ActiveUserListProps {
  setModalVisible: (modalVisible: boolean) => void;
  setModalType: (modalType: string) => void;
}

export default function ActiveUserList(props: ActiveUserListProps) {
  // Get user list from redux store
  const currentUser = useSelector((state: StoreState) => state.user);
  const { activeUserList, activeView, unactiveUserList } = useSelector((state: StoreState) => state.chat);
  const dispatch = useDispatch();

  // Local state
  const [userInfoVisible, setUserInfoVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [ownerEl, setOwnerEl] = useState(null);

  // Get props from parents
  const { setModalVisible, setModalType } = props;

  // Handles to show modal and its type
  const handleModalShow = (modalType: string) => {
    setModalType(modalType);
    setModalVisible(true);
  }

  // Handles closing settings menu
  const handleClose = () => {
    setOwnerEl(null);
    setAnchorEl(null);
  }

  // Handle user selection
  const handleUserSelect = (e: any, username: string) => {
    setOwnerEl(e.currentTarget);
    dispatch(setCurrentUser(username));
  }

  // Handles clicks for setting anchor to User Info (To private message)
  const handleUserClick = (e: any, username: string) => {
    if (username !== currentUser.username) {
      setUsername(username);
      setAnchorEl(e.currentTarget);
      setUserInfoVisible(true);
    }
  };

  // Closes popup of User Info
  const handlePopoverClose = () => {
    setUserInfoVisible(false);
    setAnchorEl(null);
  };
  
  return (
    <div className="user-list-container">
      {activeView === 'servers' ? 
      <List className="users-list">
        <ListItem className="users-list-title"> Community Members </ListItem>
        {activeUserList.map((user) => {
          return (
            <ListItem className="user-list-item" key={user.username}>
              <ListItemText
                primary={
                  <div className="message-user" onClick={e => handleUserClick(e, user.username)}>
                    {user.username}
                  </div>
                }
                className="user-list-text"
              />
              {currentUser.isOwner ? (
                <React.Fragment>
                  {currentUser.username !== user.username ? 
                  <Tooltip title="User Settings" key="server-settings" placement="right" className="tooltip">
                    <IconButton onClick={e => handleUserSelect(e, user.username)}>
                      {' '}
                      <MoreVert className="more-vert1"/>
                    </IconButton>
                  </Tooltip>
                  : null}
                </React.Fragment>
              ): null}
            </ListItem>            
          );
        })}
        {unactiveUserList.map((user) => {
          return (
            <ListItem className="user-list-item" key={user.username}>
              <ListItemText
                primary={
                  <div className="message-user" onClick={e => handleUserClick(e, user.username)}>
                    {user.username}
                  </div>
                }
                className="user-list-text1"
              />
              {currentUser.isOwner ? (
                <React.Fragment>
                  {currentUser.username !== user.username ? 
                  <Tooltip title="User Settings" key="server-settings" placement="right" className="tooltip">
                    <IconButton onClick={e => handleUserSelect(e, user.username)}>
                      {' '}
                      <MoreVert className="more-vert1"/>
                    </IconButton>
                  </Tooltip>
                  : null}
                </React.Fragment>
              ): null}
            </ListItem>
          );
        })}
    </List>
      :
      <List className="users-list">
        <ListItem className="users-list-title"></ListItem>
      </List> 
      }

      <Menu
        id="owner-settings-menu"
        anchorEl={ownerEl}
        open={Boolean(ownerEl)}
        onClick={handleClose}
        onClose={handleClose}
      >
        <MenuItem onClick={() => handleModalShow('make-admin')}> Promote </MenuItem>
        <MenuItem onClick={() => handleModalShow('remove-admin')}> Demote </MenuItem>
        <MenuItem onClick={() => handleModalShow('change-owner')}> Make Owner </MenuItem>
        <MenuItem onClick={() => handleModalShow('remove')}> Remove User </MenuItem>
      </Menu>
      
      <Popover
        id="user-info"
        open={userInfoVisible}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
      >
        <UserInfo username={username} setUserInfoVisible={setUserInfoVisible} />
      </Popover>
    </div>
  );
}
