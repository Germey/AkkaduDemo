import RTCProducer from '@akkadu/rtc-streamer-producer'

/**
 * @desciption Implements a wrapper around RTC producer and consumer to manage joined publishers
 * the goal is to be able to unsubscribe and remove streams, but still have a list of all available
 * publishers in availablePublishers for re-subscribing.
 * 
 * Defines availablePublishers for upper levels to subscribe to on will
 */
export default class RTCChannelManager extends RTCProducer {
  constructor(config:{
    stream:{
      subscribeToAudio: true,
      subscribeToVideo: false,
      container:string
    },
    event:{
      eventId:number,
      userId?:number
    }
  })
  
  /**
   * @private
   * @description reads the language of a added stream
   */
  private getStreamLanguage(domId:string):string

  /**
   * @private
   * @description adds a new publisher to available publishers if is not added yet 
   */
  private addNewPublisher(domId:string, language:string):void

  /**
   * @private
   * @description initialized listener for added stream
   */
  private initManagerListeners():void
}

export as namespace RTCChannelManager