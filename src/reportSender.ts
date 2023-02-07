import { LogLevel, WebClient } from '@slack/web-api'
import setNameToFile from './setNameToFile.js'
import envs from './envs.js'

const channelId = 'C04NE3DET53'

const filename = setNameToFile()

export const sendReportToSlack = async (zipBuffer: Buffer) => {
  const client = new WebClient(envs.slackToken, { logLevel: LogLevel.INFO })
  try {
    await client.files.uploadV2({
      channel_id: channelId,
      file: zipBuffer,
      filename: filename,
    })
  } catch (error) {
    console.error('Failed to send report message to slack', error)
    throw error
  }
}
