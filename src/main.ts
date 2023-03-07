import * as core from '@actions/core'
import axios from 'axios'

async function run(): Promise<void> {
  try {
    const token: string = core.getInput('token')
    const server: string = core.getInput('server')
    const room: string = core.getInput('room')
    const message: string = core.getInput('message')

    const encodedRoom = encodeURI(room)
    const url = `https://${server}/_matrix/client/r0/rooms/${encodedRoom}/send/m.room.message?access_token=${token}`
    const body = {
      msgtype: 'm.text',
      body: message
    }

    core.info('Sending message')
    const {data, status} = await axios.post(url, body)
    core.info(`status: ${status}`)
    core.debug(`status: ${JSON.stringify(data)}`)
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
