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
    if test "$#" -lt 2; then
      echo '{"msgtype": "m.text", "body": null}' |\
        jq --arg body "\${body}" '.body = $body' |\
        curl -s -XPOST -H "Content-Type: application/json" --data-binary @- "${url}"
    else
      echo '{"msgtype": "m.text", "body":" ", "format": "org.matrix.custom.html", "formatted_body": null}' |\
        jq --arg b "\${1}" --arg f "\${2}" '.body = $b | .formatted_body = $f' |\
        curl -s -XPOST -H "Content-Type: application/json" --data-binary @- "${url}"
    fi`
}

async function run(): Promise<void> {
  try {
    const token: string = core.getInput('token')
    const server: string = core.getInput('server')
    const room: string = core.getInput('room')
    let message: string = core.getInput('message')
    const formatted_message: string = core.getInput('formatted_message')
    const tool: boolean = core.getBooleanInput('tool')

    const encodedRoom = encodeURI(room)
    const url = `https://${server}/_matrix/client/r0/rooms/${encodedRoom}/send/m.room.message?access_token=${token}`

    if (tool) {
      core.info('Installing matrix-msg binary')
      const script = generate_tool(url)
      const home = homedir()
      mkdirSync(`${home}/.local/bin/`, {recursive: true})
      writeFileSync(`${home}/.local/bin/matrix-msg`, script, {mode: 0o755})
    }

    // if there is just a formatted message, try building a plain-text version
    if (formatted_message && !message) {
      core.info(
        'Plain text message missing. Building one from formatted message.'
      )
      message = formatted_message.replace(/<[^>]+>/g, '')
    }

    if (message) {
      core.info('Sending message')
      const body: Record<string, string> = {
        msgtype: 'm.text',
        body: message
      }
      if (formatted_message) {
        body.format = 'org.matrix.custom.html'
        body.formatted_body = formatted_message
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
