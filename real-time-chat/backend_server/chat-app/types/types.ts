export interface SocketClientList {
  username: string;
  id: string;
};

export interface SocketAction {
  type: string;
  payload: any;
};

export interface Message {
  type: 'channelMessage';
  server: string;
  channel: string;
  from: string;
  msg: string;
  timestamp: Date;
};

export interface PrivateMessage {
  type: 'privateMessage';
  from: string;
  userTo: string;
  user: string;
  msg: string;
  timestamp: Date;
};
