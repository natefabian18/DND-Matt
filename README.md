# DND Matt

A DND Game Mat that doesn't suck and doesn't ask for your money  
Powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Why?

There is no simple open free way to have a virtual online game board for playing DND

## How it works

Vite run the backend which serves a svelte website that makes a websocket connection to keep all the players in sync.

## Setup

As of right now a plugin for vite runs the websocket server so it can all be run under one command. `npm run dev` create the default svelteKit server and the websocket server.
