# Callclone

A mobile-friendly voice-calling website starter. It uses WebRTC for browser-to-browser audio and Socket.IO for call signaling. Rooms support two people at a time.

## Run it locally

1. Install Node.js 18 or newer.
2. Put all project files in the same folder.
3. In a terminal inside that folder, run:

   ```bash
   npm install
   npm start
   ```

4. Open `http://localhost:3000` in your browser.
5. To test with two people, deploy the app to an HTTPS host and open the deployed address on both devices. Microphone access generally requires HTTPS or localhost.

## Deploying

This project needs a Node.js host that can run `server.js` and keep a persistent Socket.IO connection. GitHub Pages alone cannot run the signaling server. Upload the files to a GitHub repository, then deploy the repository to a Node.js hosting service that supports WebSockets. Set the start command to `npm start`.

## Important notes

- This is a starter project, not a production-ready calling service.
- A STUN server is configured for basic connection discovery. Some networks need a TURN relay server; add a trusted TURN service to the `iceServers` configuration in `index.html` for better connectivity.
- Use HTTPS in production, add rate limits and abuse protections, and review privacy/security requirements before launching publicly.
- Do not share room codes publicly; this starter does not include user accounts or persistent room storage.
