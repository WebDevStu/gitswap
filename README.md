# gitswap

[![Build Status](https://travis-ci.org/WebDevStu/gitswap.svg?branch=master)](https://travis-ci.org/WebDevStu/gitswap)
[![npm version](https://badge.fury.io/js/gitswap.svg)](https://badge.fury.io/js/gitswap)
[![GitHub version](https://badge.fury.io/gh/webdevstu%2Fgitswap.svg)](https://badge.fury.io/gh/webdevstu%2Fgitswap)

This project has come out of my annoying habit of committing to my personal repos with my work account and more embarrassingly committing to my work repos with my personal account.

Idea came from <a href="https://github.com/joealba/gitswitch">https://github.com/joealba/gitswitch</a>, a ruby git profile switcher.

How gitswap works depends on the directory where you run it. If within a git repository directory invoking gitswap with a profile will append/change this in the `.git/config` file. If not in a git repository directory then the global `~/.gitconfig` file is updated.

## Install

    npm install -g gitswap

## Usage

To initialize, run:

    gitswap

Gitswap will read your `.gitconfig` file and check for a `.gitswap` file in your home directory, if one is not present, it will ask you to create one.

It takes the current username and email in your `.gitconfig` file and places these under the tag of `orig`.

Use the flag `--add` to add further profiles to your `.gitswap` file. Once you've filled your `.gitswap` file with all the profiles you need simply run the following to swap to that profile:

    gitswap [tag]

If this is run within a git repository it will update the local config for that repo with the correct user details. You can override this by passing the `--global` flag (see below).

## Optional flags

There are a number of flags you can pass to gitswap:

### Add new

    gitswap --add [-a]

Prompts for a new profile to be added to your cache.

### Current profile

    gitswap --current [-c]

Lists the current profile in use, if within a git repo, will report local profile else will return the global profile.

### List all

    gitswap --list [-l]

Lists all profiles saved in your `.gitswap` file

### Global flag

    gitswap [tag] --global [-g]

Updates the global `.gitconfig` file to the supplied tag. The `--global`/`-g` are optional. If you are in a git repository directory you may wish to use this to skip updating the repo config and jump straight to update the global, if you are not in a repo directory gitswap will update the global config as a default.

## Updating

You most likely installed through npm, simply run the following to update:

    npm update gitswap -g