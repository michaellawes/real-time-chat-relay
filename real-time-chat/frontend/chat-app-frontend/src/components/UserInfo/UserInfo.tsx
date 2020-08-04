import React, { useState } from 'react'
import { StoreState } from '../../reducers';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Typography, makeStyles, TextField } from '@material-ui/core';
import { sendPrivateMessage, changeView, changePMUser } from '../../actions';
import { SendPrivateMessageData } from '../../actions/types';
// <img src={process.env.PUBLIC_URL + "/user.png"} alt="user-icon" className={classes.image} />

const useStyle = makeStyles(theme => ({
  card: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    width: 250,
    background: '#FAFAFA'
  },
  cardHeader: {
    background: '#c4c4c4',
    width: '100%'
  },
  image: {
    marginTop: '1em',
    marginBottom: '8px'
  },
  cardInput: {
    padding: '1em'
  },
  input: {
    height: '38px'
  }
}));

const UserInfo = (props: any) => {

  // Get state from redux store
  const user = useSelector((state: StoreState) => state.user);
  const dispatch = useDispatch();

  // Get props from parent
  const { username, setUserInfoVisible } = props;
  const classes = useStyle();
  const [messageText, setMessageText] = useState('');

  // Handles keypress and calls the callback method
  const handleKeyPress = (e: any, callbackMethod: Function) => {
    if (e.key === "Enter") {
      callbackMethod();
    }
  }

  // Calls API to send a Private message
  const handleSendPrivateMessage = (messageText: string, username: string) => {
    const msg: SendPrivateMessageData = { type: 'privateMessage', from: user.username, msg: messageText, user: username, userTo: username, timestamp: new Date() };
    dispatch(sendPrivateMessage(msg));
    dispatch(changeView('home'));
    dispatch(changePMUser(msg.userTo));
    setUserInfoVisible(false);
  }

  return (
    <Card className={classes.card}>
      <div className={classes.cardHeader}>
        <Typography variant='body1' gutterBottom>{username}</Typography>
      </div>
      <div className={classes.cardInput}>
        <TextField
          id="user-private-message"
          label={`Private message`}
          placeholder={`Message @ ${username}`}
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, () => handleSendPrivateMessage(messageText, username))}
          variant="outlined"
          InputProps={{
            className: classes.input
          }}
          InputLabelProps={{
            shrink: true
          }}
        />
      </div>
    </Card>
  )
};

export default UserInfo;