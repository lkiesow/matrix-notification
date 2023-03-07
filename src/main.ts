import * as core from '@actions/core'

async function run(): Promise<void> {
  try {
    const token: string = core.getInput('token')
    const server: string = core.getInput('server')
    const room: string = core.getInput('room')
    const message: string = core.getInput('message')

    const encodedRoom = encodeURI(room)
    const url = `https://${server}/_matrix/client/r0/rooms/${encodedRoom}/send/m.room.message?access_token=${token}`
    const body = JSON.stringify({
      msgtype: 'm.text',
      body: message
    })

    core.info('Sending message')
    const response = await fetch(url, {
      method: 'POST',
      body
    })

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response}`)
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
