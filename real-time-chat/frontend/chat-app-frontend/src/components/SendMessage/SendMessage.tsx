import React, { useState,  useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { StoreState } from '../../reducers';
import { sendMessage, sendPrivateMessage } from '../../actions';
import { SendMessageData, SendPrivateMessageData } from '../../actions/types';

export default function SendMessage() {
  // Get State from Redux Store
  const { activeServer, activeChannel, activeView, activePMUser, pms } = useSelector((state: StoreState) => state.chat);
  const { username } = useSelector((state: StoreState) => state.user);
  const dispatch = useDispatch();

  // Local state
  const [chatMessage, setChatMessage] = useState('');
  const [placeholderTitle, setPlaceholderTitle] = useState('');

  // Check active view to determine where we send our messages
  useEffect(() => {
    if (activeView === 'servers') {
      setPlaceholderTitle(activeChannel.split('/', 2)[1]);
    } else if (activeView === 'home') {
      setPlaceholderTitle(activePMUser);
    };
  }, [activeView, activeChannel, activePMUser]);
  
  // Checks is message is valid (not just spaces)
  const isValidMessage = (msg: string) => {
    let validMessage = true;
    // Check if empty stirng
    if (msg.trim() === '') validMessage = false;
    return validMessage;
  };

  // Will format out multiple line breaks to 2 max
  const formatMessage = (msg: string) => {
    return msg.replace(/(\r\n|\r|\n){3,}/g, '$1\n\n');
  };

  // Handles submission of messages, dispatches event and sets TextField value to empty
  const handleSubmit = (message: SendMessageData | SendPrivateMessageData) => {
    if (isValidMessage(message.msg)) {
      message.msg = formatMessage(message.msg);

      // Send message to server, or user
      if (activeView === 'servers' && message.type === 'channelMessage') {
        dispatch(sendMessage(message));
      } else if (activeView === 'home' && message.type === 'privateMessage') {
        dispatch(sendPrivateMessage(message));
      };
      setChatMessage('');
    } else {
      // throw some error
    };
  };

  // Handles enter event to submit message
  const handleKeyPress = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (activeView === 'servers')
        handleSubmit({
          type: 'channelMessage',
          server: activeServer,
          channel: activeChannel,
          from: username,
          msg: chatMessage,
          timestamp: new Date()
        });
      else if (activeView === 'home')
        handleSubmit({
          type: 'privateMessage',
          from: username,
          userTo: activePMUser,
          user: activePMUser,
          msg: chatMessage,
          timestamp: new Date ()
        });
    };
  };

  // Handles changes in message box (catches enter to not send new lines. (Must send SHIFT+ENTER))
  const handleOnChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (e.target.value !== '\n') setChatMessage(e.target.value);
  };

  // Determines if send message will work
  const canMessage = ():Boolean => {
    if (activeView === 'servers') {
      if (activeServer !== '') {
        return true;
      } else {
        return false;
      }
    } else {
      if(pms === {}) {
        return false;
      } else {
        if (pms === undefined || pms[activePMUser] === undefined || Object.keys(pms)[0] === undefined) {
          return false;
        } else {
          return true;
        }
      }
    }
  }

  if(canMessage()) {
    return (
      <React.Fragment>
        <div className="send-message-border" />
        <div className="send-message-container">
          <textarea
            aria-label="empty textarea"
            placeholder={`Message  #${placeholderTitle}`}
            className="message-text-area"
            value={chatMessage}
            onChange={e => handleOnChange(e)}
            onKeyPress={e => handleKeyPress(e)}
          />
        </div>
      </React.Fragment>
    );
  } else {
    return (
      <React.Fragment></React.Fragment>
    );
  }
}