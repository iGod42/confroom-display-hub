# confroom-display-hub
A hub to expose conference room status and booking functions

## Motivation
The idea is to have this in a local environment with clients that lack the IO to allow for proper authentication.
Since this is obviously not secure, only conference rooms will be authorized, no "admin access" is required, and no information about participants or something that could be sensitive is exposed.

## Structure
Preperations have been made for the hub to work with any calendar service. 
The implementation as is assumes that the service uses OAuth2 Authorization code flow. 

Only Office365 api is currently implemented, but Google Calendar could be added pretty easily.

## Features
Basically expose basic calendar information and functionality to clients, while being agnostic about what Service is used in the background.

### What's currently implemented
- Authorize Office365 conference rooms
- Get list of authorized conference rooms
- Get list of events for the current day, (it's actually 3 days to account for possible time zone issues)
- Update the time and subject of an event
- Create events. Why? The idea is to have a button on the display to quickly reserve the room assuming it's available
- Socket.io to receive updates about events