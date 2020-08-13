import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AddCircleOutline, AlbumRounded, Home } from '@material-ui/icons';
import { List, Tooltip, IconButton } from '@material-ui/core';
import { changeRoom, changeView } from '../../actions';
import { StoreState } from '../../reducers';


interface RoomListProps {
  setModalVisible: (modalVisible: boolean) => void;
  setModalType: (modalType: string) => void;
}

const RoomList = (props: RoomListProps) => {
  // Get state from Redux Store
  const chatStore = useSelector((state: StoreState) => state.chat);
  const user = useSelector((state: StoreState) => state.user);
  const dispatch = useDispatch();

  // If no rooms have been joined use an empty array
  let rooms = Object.keys(chatStore.rooms);
  if(rooms === undefined) {
    rooms = [];
  }

  // Get props from parent
  const { setModalVisible, setModalType } = props;

  // Handles room change, and closes drawer if on mobile view
  const handleRoomChange = (room: string) => {
    dispatch(changeRoom(room, user.username));
  }

  // Handles to show modal and its type
  const handleModalShow = () => {
    setModalType('room-create-join');
    setModalVisible(true);
  }

  // Handles changing the view and calls callback function
  const handleChangeView = (view: string, callBack?: Function) => {
    dispatch(changeView(view));
    if (callBack !== undefined) callBack();
  }

  return (
    <div className="rooms-container">
      <List>
        <div className="home-icon-wrapper">
          <Tooltip title="Home" key="home" placement="right" className="tooltip">
            <IconButton className="home-icon" onClick={() => handleChangeView('home')}>
              <Home />
            </IconButton>
          </Tooltip>
        </div>
        <div className="menu-seperator" />
        {rooms.map(room => (
          <Tooltip title={room.split('/', 2)[1]} key={room} placement="right" className="tooltip">
            <IconButton
              className="room-icon"
              onClick={() => handleChangeView('rooms', () => handleRoomChange(room))}
            >
              <AlbumRounded />
            </IconButton> 
          </Tooltip>
        ))}

        <Tooltip title="Create room" key="create-room" placement="right" className="tooltip">
          <IconButton className="room-icon" onClick={() => handleChangeView('rooms', () => handleModalShow())}>
            <AddCircleOutline />
          </IconButton>
        </Tooltip>
      </List>
    </div>
  );
}

export default RoomList;