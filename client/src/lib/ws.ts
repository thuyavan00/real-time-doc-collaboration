import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export function createStomp(onConnect: () => void, onError?: (e: unknown) => void) {
  const userId = (crypto.randomUUID && crypto.randomUUID()) || `anon-${Math.random().toString(36).slice(2)}`
  const client = new Client({
    webSocketFactory: () => new SockJS('/ws'),
    reconnectDelay: 2000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    connectHeaders: { 'x-user-id': userId }, // <<< pass unique id
    onConnect: () => onConnect(),
    onStompError: (frame) => onError?.(frame),
    debug: () => {}
  })
  client.activate()
  return client
}