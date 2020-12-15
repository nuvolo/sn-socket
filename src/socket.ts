import { getSocketPath } from './utils';
declare const amb: any;

interface AmbExt {
  from_user: string;
  processed_by_glide: boolean;
  sys_id: string;
}

interface AmbGlideChanges {
  [key: string]: { display_value: string; value: string };
}

interface SNSocketData {
  record?: AmbGlideChanges;
  sys_id: string;
  table_name: string;
  operation: string;
  changes: string[] /* NOTE: does not include sys fields (e.g. sys_updated_on) */;
}

interface AmbData extends SNSocketData {
  sent_by?: number;
  action: string;
  display_value: string;
}

interface AmbSocketChangeObj {
  channel: string;
  data: AmbData;
  ext: AmbExt;
}

interface SNSocketCallback {
  (payload: SNSocketData): any;
}

interface AmbCallback {
  (payload: AmbSocketChangeObj): any;
}

interface AmbChannel {
  subscribe(params: AmbCallback): AmbChannel;
  getSubscriptionCallback(): any;
  getCallback(): AmbCallback;
  getID(): string;
  setNewChannel(channel: any): any;
  resubscribe(): AmbChannel;
  unsubscribe(): AmbChannel;
  publish(params: any): any;
  getName(): string;
}

interface SNSocketUnsubscribe {
  (): void;
}

interface SNSocketParams {
  table: string;
  filter: string;
  cb: SNSocketCallback;
}

interface _SocketCache {
  [key: string]: AmbChannel;
}

const cache: _SocketCache = {};

function _getClient() {
  if (amb) {
    return amb.getClient();
  }

  console.error(`Failed to subscribe websocket channel. 
                 The amb scripts are loaded separately from nuux via the ServiceNow instance. 
                 Perhaps include the /scripts/glide-amb-client-bundle.min.js in your UI Page and retry.`);
}

function _getChannel(client: any, path: string): AmbChannel {
  return client.getChannel(path);
}

function _coerceSNResponseData(
  incomingPayload: AmbSocketChangeObj,
): SNSocketData {
  const { data } = incomingPayload;
  const { action, display_value, ...payload } = data;
  return payload;
}

function _getCallbackHandler(callback: SNSocketCallback) {
  const cb = (payload: AmbSocketChangeObj) => {
    const data: SNSocketData = _coerceSNResponseData(payload);
    return callback(data);
  };

  return cb;
}

function _subscribe(client: any, params: SNSocketParams): SNSocketUnsubscribe {
  const { cb, table } = params;
  const path = getSocketPath(params);
  const _callback = _getCallbackHandler(cb);
  const channel = _getChannel(client, path);
  channel.subscribe(_callback);
  cache[table] = channel;
  return () => {
    delete cache[table];
    channel.unsubscribe();
  };
}

function noop() {}

function subscribe(params: SNSocketParams): SNSocketUnsubscribe {
  const { table } = params;
  const client = _getClient();
  const _shouldSubscribe = client && !cache[table];
  /* If amb is not loaded, return a noop function */
  return _shouldSubscribe ? _subscribe(client, params) : noop;
}

export { subscribe, SNSocketParams, SNSocketData };
