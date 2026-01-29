# GitHub Actions to Send Matrix Notifications

This actions will easily let you send notifications to Matrix rooms.


## Usage


```yaml
- uses: lkiesow/matrix-notification@v1
  with:
    # The Matrix home server to send the message to
    # Default: matrix.org
    server: matrix.org

    # Secret token used for authentication.
    token: ...

    # Identifier of the room to send the message to
    room: '!gwaqKjZRpCQkpkTVwh:matrix.org'

    # The type of message to send
    # Default: m.text
    message_type: m.notice

    # The message to send (optional)
    message: Hello world

    # An HTML formatted version of the message to send (optional)
    formatted_message: Hello <b>World</b>!

    # If to install the matrix-msg binary
    # Default: false
    tool: false
```

## Using the `matrix-msg` binary

If `tool` is set to `true`, a binary called `matrix-msg` will be installed
which can be used to easily send messages throughout the remainder of the GitHub Action job.
The binary can be used either with the message as the first argument:

```
matrix-msg "The message"
```

…or by piping the message into the tool:

```
echo The message | matrix-msg
```

You can also add a formatted version of the message as second command line
argument:

```
matrix-msg "The message" "The <b>message</b>"
```


## Matrix Token

An easy way to register a new session token is to use cURL to log-in via API:

```bash
❯ USER=@someone:matrix.org
❯ PASS=someVerySecretPassword
❯ curl -XPOST \
  -H 'Content-Type: application/json' \
  -d '{"type":"m.login.password", "user":"'"${USER}"'", "password":"'"${PASS}"'"}' \
  "https://matrix.org/_matrix/client/r0/login"
{..., "access_token":"aSecretSessionToken", ...}
```
