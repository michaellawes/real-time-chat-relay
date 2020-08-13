import { ACTION, ChatActionTypes } from '../actions/types';

const deleteServerMessageWithId = (items: Array<MessageInterface>, msgId: string): Array<MessageInterface> => {
  if (items.length > 1) {
    const objIndex = items.findIndex((obj: MessageInterface) => obj.msgId === msgId);
    if(objIndex > -1) {
      items.splice(objIndex, 1);
    };
    return items;
  } else {
    return [];
  };
};

const deletePrivateMessageWithId = (items: Array<PrivateMessageInterface>, msgId: string): Array<PrivateMessageInterface> => {
  if (items.length > 1) {
    const objIndex = items.findIndex((obj: PrivateMessageInterface) => obj.msgId === msgId);
    if(objIndex > -1) {
      items.splice(objIndex, 1);
    };
    return items;
  } else {
    return [];
  };
};

interface MessageInterface {
  from: string;
  msg: string;
  msgId: string;
  timestamp: Date;
};

interface PrivateMessageInterface {
  from: string;
  userTo: string;
  msg: string;
  msgId: string;
  timestamp: Date;
};

export interface ChatStore {
  rooms: {
    [roomConjoined: string]: {
      channels: {
        [channelConjoined: string]: { from: string; msgId: string; msg: string; timestamp: Date }[]; 
      };
      voiceChannels: {
        [voiceConjoined: string]: {};
      };
    };
  };
  pms: {
    [userPM: string]: { from: string; userTo: string; msg: string; msgId: string; timestamp: Date; }[];
  };
  activeRoom: string;
  activeChannel: string;
  activeVoice: string;
  currentMSG: string;
  selectedUser: string;
  selectedChannel: string;
  selectedVoiceChannel: string;
  justLeftVoice: boolean;
  activeUserList: { username: string }[];
  unactiveUserList: { username: string }[]
  activeView: string;
  activePMUser: string;
  voiceClients: { username: string; }[];
  voiceJoinUsername: string;
  voiceLeaveUsername: string;
  rtcSignalData: { username: string; ice?: any; sdp?: any };
};

const initialState = {
  rooms: {},
  pms: {},
  activeRoom: '',
  activeChannel: '',
  activeVoice: '',
  currentMSG: '',
  selectedUser: '',
  selectedChannel: '',
  selectedVoiceChannel: '',
  justLeftVoice: false,
  activeUserList: [],
  unactiveUserList: [],
  activeView: 'servers',
  activePMUser: '',
  voiceClients: [],
  voiceJoinUsername: '',
  voiceLeaveUsername: '',
  rtcSignalData: { username: '' }
};

export const chatReducer = (state: ChatStore = initialState, action: ChatActionTypes) => {
  switch (action.type) {
    case ACTION.RECEIVE_SOCKET_MESSAGE:
      return {
        ...state,
        rooms: {
          ...state.rooms,
          [action.payload.room]: {
            ...state.rooms[action.payload.room],
            channels: {
              ...state.rooms[action.payload.room].channels,
              [action.payload.channel]: [...state.rooms[action.payload.room].channels[action.payload.channel], { from: action.payload.from, msgId: action.payload.msgId, msg: action.payload.msg, timestamp: action.payload.timestamp }]
            }
          }
        }
      };
    case ACTION.RECEIVE_SOCKET_PRIVATE_MESSAGE:
      if(state.pms !== undefined) {
        if(state.pms[action.payload.user]) {
          return {
            ...state,
            pms: {
              ...state.pms,
              [action.payload.user]: [...state.pms[action.payload.user], { from: action.payload.from, userTo: action.payload.userTo, msg: action.payload.msg, msgId: action.payload.msgId, timestamp: action.payload.timestamp }]
            }
          }
        } else {
          return {
            ...state,
            pms: {
              ...state.pms,
              [action.payload.user]: [{ from: action.payload.from, userTo: action.payload.userTo, msg: action.payload.msg, msgId: action.payload.msgId, timestamp: action.payload.timestamp }]
            }
          }
        };
      } else {
        return {
          ...state,
          pms: {
            [action.payload.user]: [{ from: action.payload.from, userTo: action.payload.userTo, msg: action.payload.msg, msgId: action.payload.msgId, timestamp: action.payload.timestamp }]
          }
        }
      };
    case ACTION.RECEIVE_SOCKET_JOIN_VOICE:
      return {
        ...state,
        voiceClients: action.payload.clients,
        voiceJoinUsername: action.payload.username,
        voiceLeaveUsername: ''
      };
    case ACTION.RECEIVE_SOCKET_RTC_SIGNAL:
      return { ...state, rtcSignalData: action.payload };
    case ACTION.RECEIVE_SOCKET_LEAVE_VOICE:
      return { ...state, voiceLeaveUsername: action.payload.username, voiceClients: action.payload.clients };
    case ACTION.CLEAR_VOICE_CONNECTION:
      return { ...state, voiceClients: [], voiceLeaveUsername: '', voiceJoinUsername: '' };
    case ACTION.ADD_CHANNEL:
      return {
        ...state,
        rooms: {
          ...state.rooms,
          [action.payload.room]: {
            ...state.rooms[action.payload.room],
            channels: {
              ...state.rooms[action.payload.room].channels,
              [action.payload.channel]: []
            },
          }
        }
      };
    case ACTION.ADD_ROOM:
      return {
        ...state,
        rooms: {
          ...state.rooms,
          [action.payload.room]: {
            channels: {
              [action.payload.channel]:  []
            },
            voiceChannels: {
              [action.payload.voice]: {}
            }
          }
        }
      };
    case ACTION.ADD_VOICE:
      return {
        ...state,
        rooms: {
          ...state.rooms,
          [action.payload.room]: {
            ...state.rooms[action.payload.room],
            voiceChannels: {
              ...state.rooms[action.payload.room].voiceChannels,
              [action.payload.voice]: {}
            }
          }
        }
      };
    case ACTION.GET_INITIAL_DATA:
      return {
        ...state,
        rooms: action.payload.rooms,
        pms: action.payload.pms,
        activeRoom: Object.keys(action.payload.rooms)[0],
        activeChannel: Object.keys(action.payload.rooms[Object.keys(action.payload.rooms)[0]].channels)[0]
      };
    case ACTION.REFRESH_DATA:
      return {
        ...state,
        rooms: action.payload.rooms,
        pms: action.payload.pms,
      };
    case ACTION.CHANGE_ROOM:
      return {
        ...state,
        activeRoom: action.payload,
        activeChannel: Object.keys(state.rooms[action.payload].channels)[0],
      };
    case ACTION.CHANGE_CHANNEL:
      return { ...state, activeChannel: action.payload };
    case ACTION.CHANGE_VOICE:
      return { ...state, activeVoice: action.payload };
    case ACTION.CHANGE_VIEW:
      if(action.payload === 'servers') {
        return { ...state, activeView: action.payload };
      } else {
        if(state.pms === undefined) {
          return { ...state, activeView: action.payload, activePMUser: state.activePMUser };
        } else {
          if(Object.keys(state.pms)[0] !== undefined) {
            return { ...state, activeView: action.payload, activePMUser: Object.keys(state.pms)[0] };
          } else {
            return { ...state, activeView: action.payload, activePMUser: state.activePMUser };
          }
        };
      };
    case ACTION.RENAME_ROOM:
      let prev = state.rooms[state.activeRoom];
      delete state.rooms[state.activeRoom];
      return { 
        ...state,
        rooms: {
          [action.payload]: prev
        },
        activeRoom: action.payload
       };
    case ACTION.RENAME_CHANNEL:
      let prev1 = state.rooms[action.payload.room].channels[action.payload.channel];
      delete state.rooms[action.payload.room].channels[action.payload.channel];
      return { 
        ...state,
        rooms: {
          ...state.rooms,
          [action.payload.room]: {
            ...state.rooms[action.payload.room],
            channels: {
              ...state.rooms[action.payload.room].channels,
              [action.payload.channel]: prev1
            }
          }
        },
        activeChannel: action.payload.channel 
      };
    case ACTION.RENAME_VOICE:
      let prev2 = state.rooms[action.payload.room].voiceChannels[action.payload.voice];
      delete state.rooms[action.payload.room].voiceChannels[action.payload.voice];
      return { 
        ...state,
        rooms: {
          ...state.rooms,
          [action.payload.room]: {
            ...state.rooms[action.payload.room],
            voiceChannels: {
              ...state.rooms[action.payload.room].voiceChannels,
              [action.payload.voice]: prev2
            }
          }
        }
      };
    case ACTION.LEAVE_VOICE:
      return { ...state, activeVoice: '' };
    case ACTION.DELETE_ROOM:
      if(Object.keys(state.rooms).length === 1) {
        return { 
          ...state,
          rooms: {},
          activeRoom: '',
          activeChannel: '',
          activeVoice: '',
        }
      } else {
        delete state.rooms[action.payload];
        return { 
          ...state,
          activeRoom: Object.keys(state.rooms)[0],
          activeChannel: Object.keys(state.rooms[Object.keys(state.rooms)[0]].channels)[0], 
          activeVoice: '' 
        };
      }
    case ACTION.DELETE_CHANNEL:
      delete state.rooms[action.payload.room].channels[action.payload.channel];
      return { ...state };
    case ACTION.DELETE_VOICE:
      delete state.rooms[action.payload.room].voiceChannels[action.payload.voice];
      return { ...state };
    case ACTION.DELETE_MESSAGE:
      const adjustedServerArray = deleteServerMessageWithId(state.rooms[action.payload.room].channels[action.payload.channel], action.payload.msgId);
      return {
        ...state,
        rooms: {
          ...state.rooms,
          [action.payload.room]: {
            ...state.rooms[action.payload.room],
            channels: {
              ...state.rooms[action.payload.room].channels,
              [action.payload.channel]: adjustedServerArray
            }
          }
        }
      };
    case ACTION.DELETE_PRIVATE_MESSAGE:
      const adjustedDMArray = deletePrivateMessageWithId(state.pms[action.payload.userMessaged], action.payload.msgId);
      return { 
        ...state,
        pms: {
          ...state.pms,
          [action.payload.userMessaged]: adjustedDMArray
        } 
      };
    case ACTION.CHANGE_PM_USER:
      return { ...state, activePMUser: action.payload };
    case ACTION.UPDATE_ACTIVE_USERS:
      return { ...state, activeUserList: action.payload };
    case ACTION.UPDATE_UNACTIVE_USERS:
      return { ...state, unactiveUserList: action.payload };
    case ACTION.SET_CURRENT_MESSAGE:
      return { ...state, currentMSG: action.payload };
    case ACTION.SET_CURRENT_USER:
      return { ...state, selectedUser: action.payload };
    case ACTION.SET_SELECTED_CHANNEL:
      return { ...state, selectedChannel: action.payload };
    case ACTION.SET_SELECTED_VOICE:
      return { ...state, selectedVoiceChannel: action.payload };
    case ACTION.SET_JUST_LEFT_VOICE:
      return { ...state, justLeftVoice: action.payload };
    default:
      return { ...state };
  }
}