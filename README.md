# gitswap

[![Build Status](https://travis-ci.org/WebDevStu/gitswap.svg?branch=master)](https://travis-ci.org/WebDevStu/gitswap)
[![npm version](https://badge.fury.io/js/gitswap.svg)](https://badge.fury.io/js/gitswap)
[![GitHub version](https://badge.fury.io/gh/webdevstu%2Fgitswap.svg)](https://badge.fury.io/gh/webdevstu%2Fgitswap)

This project has come out of my annoying habit of committing to my personal repos with my work account and more embarrassingly committing to my work repos with my personal account.

Idea came from <a href="https://github.com/joealba/gitswitch">https://github.com/joealba/gitswitch</a>, a ruby git profile switcher.

## Install

    npm install -g gitswap

## Usage

To initialize, run:

    gitswap

Gitswap will read your `.gitconfig` file and check for a `.gitswap` file in your home directory, if one is not present, it will ask you to create one.

It takes the current username and email in your `.gitconfig` file and places these under the tag of `orig`.

Once you've filled your .gitswap file with all the profiles you need simply run the following to swap to that profile:

    gitswap [tag]

If this is run within a git repository it will update the local config for that repo with the correct user details. You can over-ride this by passing the `--global` flag (see below).

## Optional flags

There are a number of flags you can pass to gitswap:

### Current profile

    gitswap --current [-c]

Lists the current profile in use, if within a git repo, will report local profile else will return the global profile.

### List all

    gitswap --list [-ls]

Lists all profiles saved in your `.gitswap` file

### Add new

    gitswap --add [-a]

Prompts for a new profile to be added to your cache.

### Global flag

    gitswap [tag] --global [-g]

Updates the global `.gitconfig` file to the supplied tag. The `--global`/`-g` are optional. If you are in a git repository directory you may wish to use this to skip updating the repo config and jump stright to update the global.