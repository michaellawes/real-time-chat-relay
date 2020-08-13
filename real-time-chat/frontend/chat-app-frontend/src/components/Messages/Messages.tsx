import React, { useEffect, useState } from 'react';
import { MoreVert } from '@material-ui/icons';
import { useSelector, useDispatch } from 'react-redux';
import {
  List,
  ListItem,
  /*
  ListItemAvatar,
  Avatar,
  */
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  Fade,
  Popover,
  CircularProgress
} from '@material-ui/core';
import moment from 'moment';
import UserInfo from '../UserInfo/UserInfo';
import { StoreState } from '../../reducers';
import { setCurrentMSG } from '../../actions';
/*
  <ListItemAvatar className="message-user-icon">
    <Avatar>
      <img
        onClick={e => handleUserClick(e, message.from)}
        src={process.env.PUBLIC_URL + '/user.png'}
        alt="user icon"
        height="48"
      />
    </Avatar>
  </ListItemAvatar>
*/
interface Message {
  from: string;
  userTo?: string;
  msgId: string;
  msg: string;
  timestamp: Date;
}

interface MessageListProps {
  setModalVisible: (modalVisible: boolean) => void;
  setModalType: (modalType: string) => void;
}

export default function Messages(props: MessageListProps) {

  // Get States from Redux Store
  const user = useSelector((state: StoreState) => state.user);
  const chatStore = useSelector((state: StoreState) => state.chat);
  const { activeView, activePMUser, activeRoom, activeChannel } = chatStore;
  const dispatch = useDispatch();

  // Local states
  const [userInfoVisible, setUserInfoVisible] = useState(false);
  const [messageIndex, setMessageIndex] = useState(12);
  const [loadMessages, setLoadMessages] = useState(false);
  const [username, setUsername] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [messageAnchorEl, setMessageAnchorEl] = useState(null);

  // Get props from parents
  const { setModalVisible, setModalType } = props;

  // ref to message container (for keeping scroll to bottom of chat)
  let messageContainerBottomRef = document.getElementById('messagesContainerBottom');
  let messageContainerRef = document.getElementById('messagesContainer');

  // Get message list from channel or from specific user
  let messages: Message[] = [];
  let messagesLength = 0;
  if (activeView === 'servers') {
    if (chatStore.rooms[activeRoom] !== undefined) {
      messages = chatStore.rooms[activeRoom].channels[activeChannel];
    };
    if(messages !== undefined) {
      messagesLength = messages.length;
    } else {
      messages = [];
    };
  } else {
    // If no messages need to make empty array
    if (chatStore.pms === undefined || chatStore.pms[activePMUser] === undefined) {
      messages = [];
    } else {
      messages = chatStore.pms[activePMUser];
    }
    messagesLength = messages.length;
  };

  // Scroll to bottom of container if were not loading new messages
  useEffect(() => {
    if (messageContainerBottomRef && messageContainerRef) {
      if (loadMessages) {
        messageContainerRef.scroll(0, 60);
      } else {
        messageContainerBottomRef.scrollIntoView({ block: 'end', behavior: 'smooth' });
      };
    };
  }, [loadMessages, messages, messageContainerRef, messageContainerBottomRef]);

  // Checks is message is a code block
  const isTextCodeBlock = (message: string) => {
    if (message.startsWith('```') && message.endsWith('```')) return true;
    else return false;
  };

  // Handles to load more messages when scroll at top
  const handleScrollTop = (e: any) => {
    const element = e.target;
    if (element.scrollTop > 60) {
      setLoadMessages(false);
    };
    if (element.scrollTop === 0) {
      if (messagesLength > messageIndex) {
        setTimeout(() => {
          setLoadMessages(true);
          if (messageIndex + 12 > messagesLength) {
            setMessageIndex(messagesLength);
          } else {
            setMessageIndex(messageIndex + 12);
          };
        }, 400);
      };
    };
  };

  // Formats the code block
  const formatCode = (message: string) => {
    return message.split('```')[1];
  };

  // Handles clicks for setting anchor to User Info (To private message)
  const handleUserClick = (e: any, username: string) => {
    if(username !== user.username) {
      setUsername(username);
      setUserInfoVisible(true);
      setAnchorEl(e.currentTarget);
    };
  };

  // Closes popup of User Info
  const handlePopoverClose = () => {
    setUserInfoVisible(false);
    setAnchorEl(null);
  };

  // Handles to show modal and its type
  const handleModalShow = (modalType: string) => {
    setModalType(modalType);
    setModalVisible(true);
  };

  // Handles showing of Settings Menu
  const handleSettingsClick = (e: any) => {
    setMessageAnchorEl(e.currentTarget);
  };

  // Handle message selection
  const handleMessageSelect = (msgId: string, callBack: Function) => {
    dispatch(setCurrentMSG(msgId));
    callBack();
  };

  // Checks if message can be deleted
  const canDelete = (username: string):Boolean => {
    if (activeView === 'servers') {
      if(user.isAdmin || user.username === username || user.isOwner) {
        return true;
      } else {
        return false;
      };
    } else {
      if (user.username === username) {
        return true;
      } else {
        return false;
      }
    }
  };

  // Handles closing settings menu
  const handleClose = () => {
    setMessageAnchorEl(null);
  };

  // Ensures message text is black
  const style = {
    color: 'black'
  }

    return (
      <div
        id="messagesContainer"
        className="messages-container"
        onScroll={e => handleScrollTop(e)}
        ref={element => (messageContainerRef = element)}
      >
        {messagesLength >= messageIndex ? (
          <div className="progress-container">
            <CircularProgress color="primary" />
          </div>
        ) : null}
        <List>
          {messages !== null
            ? messages.slice(messagesLength - messageIndex, messagesLength).map((message) => {
                // Filter for null messages (dummy message on backend should fix...)
                return (
                  <Fade in={true} timeout={500} key={message.msgId}>
                    <ListItem className="message">
                      {isTextCodeBlock(message.msg) ? (
                        <ListItemText
                          primary={
                            <div className="message-user" onClick={e => handleUserClick(e, message.from)}>
                              {message.from}
                              <div className="message-date">{` - ${moment(message.timestamp).format('LLL')}`}</div>
                            </div>
                          }
                          secondary={
                            <pre className="prettyprint">
                              <div dangerouslySetInnerHTML={{ __html: formatCode(message.msg) }}></div>
                            </pre>
                          }
                          className="message-text"
                        />
                      ) : (
                        <ListItemText
                          primary={
                            <div className="message-user" onClick={e => handleUserClick(e, message.from)}>
                              {message.from}
                              <div className="message-date">{` - ${moment(message.timestamp).format('LLL')}`}</div>
                            </div>
                          }
                          secondaryTypographyProps={{ style: style }}
                          secondary={message.msg}
                          className="message-text"
                        />
                      )}
                      {canDelete(message.from) ? (
                        <React.Fragment>
                          <Tooltip title="Message Settings" key="server-settings" placement="right" className="tooltip">
                          <IconButton onClick={e => handleMessageSelect(message.msgId, () => handleSettingsClick(e))}>
                            {' '}
                            <MoreVert className="more-vert"/>{' '}
                          </IconButton>
                        </Tooltip>
                        </React.Fragment>
                      ) : null}
                    </ListItem>
                  </Fade>
                );
              })
            : null}
        </List>
        <div ref={element => (messageContainerBottomRef = element)} id="messagesContainerBottom"></div>
        <Popover
          id="user-info"
          open={userInfoVisible}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left'
          }}
        >
          <UserInfo username={username} setUserInfoVisible={setUserInfoVisible} />
        </Popover>

        <Menu
          id="message-settings-menu"
          anchorEl={messageAnchorEl}
          open={Boolean(messageAnchorEl)}
          onClick={handleClose}
          onClose={handleClose}
        >
          <MenuItem onClick={() => handleModalShow('message-delete')}>
            {' '}
            Delete Message{' '}
          </MenuItem>
        </Menu>
      </div> 
    );
}
