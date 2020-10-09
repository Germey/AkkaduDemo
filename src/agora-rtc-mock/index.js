/* eslint-disable class-methods-use-this */
/* eslint-disable */
import { EventEmitter } from 'events'
import streamData from './stream-data-host'
const acceptedRoles = ['audience','host']

export class AgoraRTCMockClass {
  constructor() {
    this.client = {}
    this.Logger = new Logger()
    this.VERSION = 'test-version'
  }
  createClient({ mode, codec }) {
    this.mode = mode
    this.codec = codec
    this.client = new Client()
    return this.client
  }

  createStream({ streamID,
    audio,
    video, 
    screen }) {
    if (streamID !== this.client.uid) {
      throw new Error(`AgoraRTC.createStream got invalid streamID, should be an existing uid (see agora-rtc-mock/stream-data.js), got ${streamID}`)
    }
    if (typeof audio !== 'boolean') {
      throw new TypeError(`AgoraRTC.createStream got invalid config audio, should be boolean, got ${audio}`)
    }
    if (typeof video !== 'boolean') {
      throw new TypeError(`AgoraRTC.createStream got invalid config video, should be boolean, got ${video}`)
    }
    if (typeof screen !== 'boolean') {
      throw new TypeError(`AgoraRTC.createStream got invalid config screen, should be boolean, got ${screen}`)
    }
    return new Stream(streamID)
  }
}

class Logger {
  constructor() {
    this.ERROR = ''
    this.WARN = ''
    this.INFO = ''    
  }
  setLogLevel() {
    
  }
}

function parsePublishers(publishers) {
  const pubObj = {}
  publishers.forEach((publisher) => {
    const id = publisher.sourceLanguage ? publisher.userId : publisher.interpreterId
    publisher.stream = new Stream(id) // add stream to each publisher
    pubObj[`${id}`] = publisher
  })
  return pubObj
}

export class Client {
  constructor() {
    this.emitter = new EventEmitter()
    this.token = streamData.auth.token
    this.uid = null
    this.channel = streamData.auth.channel
    this.appId = streamData.auth.appId
    this.publishers = parsePublishers(streamData.publishers)
  }

  /**
   * @description emits all publishers as stream added
   */
  emitAddAllPublishers() {
    const publisherIds = Object.keys(this.publishers)
    publisherIds.forEach((publisherId) => {
      const stream = new Stream(parseInt(publisherId,10)) // since we are using keys, they are string and we need numbers
      const evt = { stream }
      this.emitter.emit('stream-added',evt)
    })
  }

  /**
   * @description return each publisher with included stream object
   */
  getResetPublisherStreamObjects() {
    const publisherIds = Object.keys(this.publishers)
    const events = []
    publisherIds.forEach((publisherId) => {
      const stream = new Stream(parseInt(publisherId,10)) // since we are using keys, they are string and we need numbers
      const evt = { stream }
      events.push(evt)
    })
    return events
  }


  emitRemoveAllPublishers() {
    const publisherIds = Object.keys(this.publishers)
    publisherIds.forEach((publisherId) => {
      const id = parseInt(publisherId,10)  // since we are using keys, they are string and we need numbers
      this.removeStream(id)
    })
  }


  init(appId, onSuccess, onFailure) {
    if (appId !== this.appId) {
      onFailure(new Error(`Not a valid appId (see agora-rtc-mock/stream-data.js) for reference, got ${appId}`))
    } 
    onSuccess()
  }

  join(token,channel,uid, onSuccess, onFailure) {
    if (token !== this.token) {
      onFailure(new Error(`Not a valid token (see agora-rtc-mock/stream-data.js) for reference, got ${token}`))
    }
    else if (channel !== this.channel) {
      onFailure(new Error(`Not a valid channel (see agora-rtc-mock/stream-data.js) for reference, got ${channel}`))
    }
    else if (!uid) {
      onFailure(new Error('Not a valid uid. You need to provide a uid'))
    }
    this.uid = uid
    this.emitter.emit('connected')
    this.emitter.emit('connection-state-change')
    onSuccess()
  }

  setClientRole(role, callback) {
    if (!acceptedRoles.includes(role)) {
      callback(new Error(`Not a valid role, got: ${role}`))
    }
    this.role = role
  }

  unsubscribe(stream, onFailure) {
    if (!stream) {
      onFailure(new Error('stream has to be defined on unsubscribe'))
    }
    // if (!stream.stream) {
    //   onFailure(new Error('stream needs to have a attached mediastream on unsubscribe'))
    // }
    stream.stream = null
  }

  subscribe(stream, config, onFailure) {
    if (!config) {
      onFailure(new Error('Client.subscribe has to have a config'))
    }
    if (config.audio && typeof config.audio !== 'boolean') {
      onFailure(new Error('Client.subscribe config.audio needs to be boolean'))
    }
    if (config.video && typeof config.video !== 'boolean') {
      onFailure(new Error('Client.subscribe config.video needs to be boolean'))
    }
    const id = stream.getId()
    if (!this.publishers[`${id}`]) {
      onFailure(new Error(`No such stream, refer to agora-rtc-mock/stream-data.js, got ${JSON.stringify(stream)}`))
    }
    stream.stream = { MediaStream:true }
    this.emitter.emit('stream-subscribed', { stream })
  }
  
  publish(stream, onFailure) {
    if (!(stream instanceof Stream)) {
      onFailure(`Client.publish needs a valid stream, got ${stream}`)
    }
  }

  unpublish(stream, onFailure) {
    if (!(stream instanceof Stream)) {
      onFailure(`Client.unpublish needs a valid stream, got ${stream}`)
    }
  }

  on(event,fn) {
    this.emitter.on(event,fn)
  }

  // Internal simulation functions

  /**
   * @description a publisher removes themselves by calling unpublish
   * @param {number} id 
   */
  removeStream(id) {
    const { stream } = this.publishers[`${id}`]
    this.emitter.emit('stream-removed', { stream })
  }

  /**
   * @description a publisher looses connection
   * @param {number} id 
   */
  peerLeave(id) {
    const { stream } = this.publishers[`${id}`]
    this.emitter.emit('peer-leave', { stream })
  }
}


export class Stream {
  constructor(id) {
    this.id = id
    this.playing = false
    this.stream = { MediaStream : true }
  }
  /**
   * @see https://docs.agora.io/en/Audio%20Broadcast/API%20Reference/web/interfaces/agorartc.stream.html#isplaying
   */
  isPlaying() {
    return this.playing
  }

  play(domId,config,callback) {
    if (!domId) {
      callback(new Error('stream.play: domId needs to be defined'))
    }
    if (typeof domId !== 'string') {
      callback(new Error('stream.play passed container id needs to be a string'))
    }
    if (!config) {
      callback(new Error('stream.play needs configuration to be passed as second element'))
    }
    this.playing = true
    callback()
  }

  async resume() {
    this.playing = true
  }

  stop() {
    this.playing = false
  }
  getId() {
    return this.id
  }
  init(onSuccess, onFailure) {
    onSuccess()
  } 
  muteAudio() {
    this.playingAudio = false
    if (!this.playingAudio && !this.playingVideo) {
      this.playing = false
    }
  }
  muteVideo() {
    this.playingVideo = false
    if (!this.playingAudio && !this.playingVideo) {
      this.playing = false
    }
  }
  hasAudio() {
    return true
  }
  hasVideo() {
    return true
  }
  unmuteAudio() {
    this.playingAudio = true
    if (this.playingAudio || this.playingVideo) {
      this.playing = true
    }
  }

  unmuteVideo() {
    this.playingVideo = true
    if (this.playingAudio || this.playingVideo) {
      this.playing = true
    }
  }

  setAudioProfile() {
    
  }

  setAudioVolume() {
    
  }
  close() {}
}

const AgoraRTC = new AgoraRTCMockClass()
export default AgoraRTC
