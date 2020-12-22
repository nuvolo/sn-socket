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

interface AmbData {
  action: 'entry' | 'change' | 'exit';
  record?: AmbGlideChanges;
  sys_id: string; // target record
  table_name: string;
  operation: 'insert' | 'update' | 'delete';
  changes: string[] /* NOTE: does not include sys fields (e.g. sys_updated_on) */;
  sent_by?: number;
  display_value: string; // Display value of the DB record
}

interface AmbSocketChangeObj {
  channel: string;
  data: AmbData;
  ext: AmbExt;
}

interface SNSocketCallback {
  (payload: AmbData): void;
}

interface AmbCallback {
  (payload: AmbSocketChangeObj): void;
}

interface AmbChannel {
  getCallback(): AmbCallback;
  getID(): string;
  resubscribe(): AmbChannel;
  subscribe(callback: SNSocketCallback): AmbChannel;
  unsubscribe(): AmbChannel;
  getName(): string;
}

interface SNSocketUnsubscribe {
  (): void;
}

interface SNSocketParams {
  table: string;
  filter: string;
  callback: SNSocketCallback;
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

function subscribeToClient(client: any, params: SNSocketParams): SNSocketUnsubscribe {
  const { callback, table } = params;
  const path = getSocketPath(params);
  const channel = getChannel(client, path);
  channel.subscribe(callback);
  cache[table] = channel;
  return () => {
    delete cache[table];
    channel.unsubscribe();
  };
}

function noop() {}

/**
 *  Subscribe and respond to changes on a table which match a given filter
 * @param {Object} params - Arguments required for initializing a websocket subscription
 * @param {string} params.table - The name of target table
 * @param {string} params.filter - The query to watch. Corresponds to sysparm_query in the system
 * @param {string} params.callback - The callback to fire on notification from Websocket
 * @returns {function}  - Returns an unsubscribe function which takes no arguments. Allows one to deregister the socket subscription
 */
async function subscribe(params: SNSocketParams): Promise<SNSocketUnsubscribe> {
  const { table } = params;
  const client = getClient();
  const shouldSubscribe = client && !cache[table];
  /* If amb is not loaded, return a noop function */
  return shouldSubscribe ? subscribeToClient(client, params) : noop;
}

export { subscribe, SNSocketParams };
