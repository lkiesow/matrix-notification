# GitHub Actions to Setup an LXC Container

This actions will create a fresh LXC container on GitHub actions you can then work with.
It provide a clean, virtual machine like environment with an init system
based on many different Linux distributions to choose from.

For example, this is a great way to test Ansible roles or playbooks.


## Usage


```yaml
- uses: lkiesow/setup-lxc-container@v1
  with:
    # LXC distribution to use
    # Default: centos
    dist: centos

    # Distribution release to use
    # Default: 9-Stream
    release: 9-Stream

    # LXC container name.
    # Will also be used as hostname in /etc/hosts if configure-etc-hosts is set.
    # Default: test
    name: test

    # If to configure the container name and IP address in /etc/hosts.
    # This allows you to address the container by name when using network
    # commands like `ping test`.
    # This is required for the automatic SSH configuration and disavling this
    # will automatically disable `configure-ssh`.
    # Default: true
    configure-etc-hosts: true

    # If to configure SSH. If enabled, this will:
    # - Generate an SSH key on the host
    # - Set the key as authorized key in the container
    # - Set `lxc-init` to automatically install and enable `openssh-server` for
    #   supported distributions
    # - Import container SSH server keys
    # Default: true
    configure-ssh: true

    # If to set `lxc-init` to automatically install Python on supported
    # distributions.
    # Default: true
    python: true

    # Commands to use for setting up the container (e.g. configure SSH).
    # Setting this will overwrite in-container openssh-server and python
    # installation for supported distributions. If you set this and have
    # `configure-ssh` enabled, make sure to set up an SSH server.
    #lxc-init:
```

## Example Workflow

A simple workflow to set up a container,
get the container's IP address
and run a command in the container via `ssh`:

```yaml
name: Test
on:
  push:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: lkiesow/setup-lxc-container@v1
        id: lxc
        with:
          dist: debian
          release: bullseye

      - name: IP address
        run: |
          echo 'Container IP address: ${{ steps.lxc.outputs.ip }}'

      - name: Test SSH
        run: |
          ssh test echo success
```


## Docker Incompatibility

This action is incompatible with using Docker on GitHub Actions.
The action will disable the docker service.
Do not try using LXC and Docker in one job.


## Automatic SSH Server Setup

The action contains instructions to automatically install and enable an OpenSSH
server on several distributions. Use the `lxc-init` option to overwrite the
setup steps or to set up an OpenSSH server on non-supported distributions.

Supported are recent versions of:

- almalinux
- centos
- debian
- fedora
- rockylinux
- ubuntu


## Automatic Python Installation

The action contains instructions to automatically install Python on several
distributions if you do not use `lxc-init`. Supported are recent versions of:

- almalinux
- centos
- debian
- fedora
- rockylinux
- ubuntu


## Supported Distributions

To get the full list of available distribution and release templates,
install LXC and run:

```
❯ apt install lxc
❯ lxc-create --template download --name tmp
❯ lxc-destroy --name tmp
```

## Knows Issues

- The Ubuntu Xenial LXC container does not want to start up properly on GitHub
  Actions. Ubuntu Focal works just fine.
