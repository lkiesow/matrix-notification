import * as core from '@actions/core'
import axios from 'axios'
import {homedir} from 'os'
import {mkdirSync, writeFileSync} from 'fs'

function generate_tool(url: string): string {
  return `#!/bin/bash
    set -eu
    if test "$#" -lt 1; then
      read body
    else
      body="\${1}"
    fi
    jq --arg body "\${body}" '.body = $body' <<< '{"msgtype": "m.text", "body": null}' |\
      curl -s -XPOST -H "Content-Type: application/json" --data-binary @- "${url}"`
}

async function run(): Promise<void> {
  try {
    const token: string = core.getInput('token')
    const server: string = core.getInput('server')
    const room: string = core.getInput('room')
    const message: string = core.getInput('message')
    const tool: boolean = core.getBooleanInput('tool')

    const encodedRoom = encodeURI(room)
    const url = `https://${server}/_matrix/client/r0/rooms/${encodedRoom}/send/m.room.message?access_token=${token}`

    if (tool) {
      core.info('Installing matrix-message binary')
      const script = generate_tool(url)
      const home = homedir()
      mkdirSync(`${home}/.local/bin/`, {recursive: true})
      writeFileSync(`${home}/.local/bin/matrix-msg`, script, {mode: 0o755})
    }

    if (message) {
      core.info('Sending message')
      const body = {
        msgtype: 'm.text',
        body: message
      }
      const {data, status} = await axios.post(url, body)
      core.info(`status: ${status}`)
      core.debug(`status: ${JSON.stringify(data)}`)
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message)
    }
  }
}

run()
