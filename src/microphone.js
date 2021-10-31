import 'audioworklet-polyfill'
import log from 'loglevel'

const max = xs => xs.reduce((acc, value) => value > acc ? value : acc)

// type MicrophoneModuleConfig = {
//   NOISE_LEVEL_THRESHOLD: number,
//   onNoiseLevelAboveThreshold: (maxValue: number) => void
// }

// interface MicrophoneModule {
//   microphoneOn: () => Promise<void>
//   microphoneOff: () => void
// }

// type ConfigureMicrophoneModule = (config: MicrophoneModuleConfig) => MicrophoneModule

export default config => {

  const audioState = {
    pending: false,
    audioContext: undefined,
    mediaStream: undefined,
    microphoneOn: false
  }

  class StreamWorklet extends AudioWorkletNode {
    constructor(audioContext, name) {
      log.info(`[StreamWorklet#constructor] name: ${name}; sampleRate: ${audioContext.sampleRate}`)
      super(audioContext, name)
      this.port.onmessage = message => {
        log.info('[StreamWorklet#onMessage]')
        if (!audioState.microphoneOn) return
        const channelData = message.data
        const maxValue = max(channelData)
        if (maxValue >= config.NOISE_LEVEL_THRESHOLD) {
          config.onNoiseLevelAboveThreshold(maxValue)
        }
      }
    }
  }

  const microphoneOn = async () => {
    try {
      log.info('[microphoneOn]')
      audioState.pending = true
      if (navigator?.mediaDevices?.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const audioContext = new AudioContext()
        const source = audioContext.createMediaStreamSource(mediaStream)
        // const pathname = location.pathname
        // const pos = pathname.lastIndexOf('/')
        // const pathnameNoTrailingSlash = pos >= 0 ? pathname.substr(0, pos) : pathname
        // const base = `${location.origin}/${pathnameNoTrailingSlash}`
        // const moduleUrl = `${base}/stream-processor.js`
        // const moduleUrl = `${base}/stream-processor.js`
        await audioContext.audioWorklet.addModule('stream-processor.js')
        const streamWorklet = new StreamWorklet(audioContext, 'stream-processor')
        source.connect(streamWorklet)
        streamWorklet.connect(audioContext.destination)
        audioState.audioContext = audioContext
        audioState.mediaStream = mediaStream
        audioState.microphoneOn = true
      } else {
        throw new Error('navigator.mediaDevices.getUserMedia not found')
      }
    } catch (error) {
      log.error(`[microphoneOn] ${error.message}`)
      throw error
    }
    finally {
      audioState.pending = false
    }
  }

  const microphoneOff = () => {
    try {
      log.info('[microphoneOff]')
      if (audioState.microphoneOn) {
        audioState.mediaStream.getTracks().forEach(track => track.stop())
        audioState.audioContext.close()
        audioState.audioContext = undefined
        audioState.mediaStream = undefined
        audioState.microphoneOn = false
      }
    } catch (error) {
      log.error(`[microphoneOff] ${error.message}`)
    }
  }

  return {
    microphoneOn,
    microphoneOff
  }
}
