import io from 'socket.io-client';
import { ACTION, SocketActions } from '../actions/types';
import { Dispatch } from 'react';
import { AnyAction, MiddlewareAPI } from 'redux';

export const socketMiddleware = (baseUrl: string) => {
  return (storeAPI: MiddlewareAPI) => {
    let socket = io(baseUrl);
    // eslint-disable-next-line
    let listener: SocketIOClient.Emitter;

    // Check actions and emit from socket if needed
    return (next: Dispatch<AnyAction>) => (action: SocketActions) => {

      // Send message over socket
      if (action.type === ACTION.SEND_SOCKET_MESSAGE) {
        socket.emit('chat-message', action.payload);
        return;
      }

      // Send private message over socket
      if (action.type === ACTION.SEND_SOCKET_PRIVATE_MESSAGE) {
        socket.emit('private-message', action.payload);
        return;
      }

      // Pull sign in action and login
      if (action.type === ACTION.SIGN_IN) {
        socket.emit('sign-in', action.payload);
        listener = setupSocketListener(socket, storeAPI);
      }

      if(action.type === ACTION.GET_INITIAL_DATA) {

        // Get list of server ids (used for "room" names on socket server)
        let servers = Object.keys(action.payload.rooms);
        let roomIDs: string[] = [];
        servers.forEach((server, i) => {
          roomIDs[i] = server.split('/', 2)[0];
        });

        // Subscribe to each server (Creates a room on socket io)
        roomIDs.forEach(roomID => {
          socket.emit('subscribe', roomID)
        });
      }

      // If user creates a server we need to join that room
      if (action.type === ACTION.ADD_ROOM) {
        let roomID = action.payload.room.split('/', 2)[0];
        socket.emit('subscribe', roomID);
      }

      // Updates our active state on server
      if (action.type === ACTION.UPDATE_ACTIVE_STATE) {
        socket.emit('update-active');
      }

      // If user joins voice
      if (action.type === ACTION.SEND_SOCKET_JOIN_VOICE) {
        socket.emit('user-join-voice', action.payload);
      }

      // If user leaves voice
      if (action.type === ACTION.SEND_SOCKET_LEAVE_VOICE) {
        socket.emit('user-leave-voice', action.payload);
      }

      // Sends socket rtc signal
      if (action.type === ACTION.SEND_SOCKET_RTC_SIGNAL) {
        socket.emit('voice-signal', action.payload);
      }
      
      return next(action);
    };
  };
};

// Listens on socket with our username, listens to socket server for specific events
const setupSocketListener = (socket: SocketIOClient.Socket, storeAPI: MiddlewareAPI): SocketIOClient.Emitter => {
  return socket.on('update', (action: any) => {

    // Check for action type
    if (action.type === 'chat-message') {
      storeAPI.dispatch({
        type: ACTION.RECEIVE_SOCKET_MESSAGE,
        payload: action.payload
      });
    } else if (action.type === 'private-message') {
      storeAPI.dispatch({
        type: ACTION.RECEIVE_SOCKET_PRIVATE_MESSAGE,
        payload: action.payload
      });
    } else if (action.type === 'user-join-voice') {
      storeAPI.dispatch({
        type: ACTION.RECEIVE_SOCKET_JOIN_VOICE,
        payload: action.payload
      });
    } else if (action.type === 'user-leave-voice') {
      storeAPI.dispatch({
        type: ACTION.RECEIVE_SOCKET_LEAVE_VOICE,
        payload: action.payload
      });
    } else if (action.type === 'voice-signal') {
      storeAPI.dispatch({
        type: ACTION.RECEIVE_SOCKET_RTC_SIGNAL,
        payload: action.payload
      });
    }
  });
}