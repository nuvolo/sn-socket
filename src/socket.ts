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
  (payload: SNSocketData): void;
}

interface AmbCallback {
  (payload: AmbSocketChangeObj): void;
}

interface AmbChannel {
  getCallback(): AmbCallback;
  getID(): string;
  resubscribe(): AmbChannel;
  subscribe(callback: AmbCallback): AmbChannel;
  unsubscribe(): AmbChannel;
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

interface SocketCache {
  [key: string]: AmbChannel;
}

/** Hold reference to channel for unsubscribing */
const cache: SocketCache = {};

function getClient() {
  if (amb) {
    return amb.getClient();
  }

  console.error(`Failed to subscribe websocket channel. 
                 The amb scripts are loaded separately from nuux via the ServiceNow instance. 
                 Perhaps include the /scripts/glide-amb-client-bundle.min.js in your UI Page and retry.`);
}

function getChannel(client: any, path: string): AmbChannel {
  return client.getChannel(path);
}

function coerceSNResponseData(incomingPayload: AmbSocketChangeObj): SNSocketData {
  const { data } = incomingPayload;
  const { action, display_value, ...payload } = data;
  return payload;
}

function getCallbackHandler(callback: SNSocketCallback) {
  const cb = (payload: AmbSocketChangeObj) => {
    const data: SNSocketData = coerceSNResponseData(payload);
    return callback(data);
  };

  return cb;
}

function subscribeToClient(client: any, params: SNSocketParams): SNSocketUnsubscribe {
  const { cb, table } = params;
  const path = getSocketPath(params);
  const callback = getCallbackHandler(cb);
  const channel = getChannel(client, path);
  channel.subscribe(callback);
  cache[table] = channel;
  return () => {
    delete cache[table];
    channel.unsubscribe();
  };
}

function noop() {}

async function subscribe(params: SNSocketParams): Promise<SNSocketUnsubscribe> {
  const { table } = params;
  const client = getClient();
  const shouldSubscribe = client && !cache[table];
  /* If amb is not loaded, return a noop function */
  return shouldSubscribe ? subscribeToClient(client, params) : noop;
}

export { subscribe, SNSocketParams, SNSocketData };
