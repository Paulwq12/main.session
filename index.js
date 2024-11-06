const express = require('express');
const { default: makeWASocket, useSingleFileAuthState } = require('@adiwajshing/baileys');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.static('public'));
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

// Route to generate QR code for session
app.get('/generate-qr', async (req, res) => {
    const sock = makeWASocket({ auth: state });
    sock.ev.on('connection.update', (update) => {
        const { qr, connection } = update;
        if (qr) {
            res.send(Buffer.from(qr).toString('base64'));
        } else if (connection === 'open') {
            saveState();
        }
    });
});

// Route to generate pairing code for session
app.get('/generate-pairing', async (req, res) => {
    const phoneNumber = req.query.phone;

    if (!phoneNumber) {
        return res.status(400).send("Phone number is required");
    }

    const sock = makeWASocket({ auth: state });
    sock.ev.on('connection.update', async (update) => {
        const { connection } = update;
        if (connection === 'open') {
            // Generate the creds.json file
            const creds = JSON.stringify(state.creds, null, 2);
            const credsPath = path.join(__dirname, `${phoneNumber}-creds.json`);
            
            // Save the creds file
            fs.writeFileSync(credsPath, creds);
            
            // Send creds.json to the user as a response
            await sock.sendMessage(`${phoneNumber}@s.whatsapp.net`, {
                text: 'Connected successfully! Here are your pairing credentials.',
            });

            // After sending the message, send the creds file to the user
            res.download(credsPath, `${phoneNumber}-creds.json`, (err) => {
                if (err) {
                    console.error("Error sending file:", err);
                    res.status(500).send("Error sending the file.");
                } else {
                    // Optionally, delete the creds file after sending it
                    fs.unlinkSync(credsPath);
                }
            });
        }
    });
});

app.listen(3000, () => console.log('Server is running on http://localhost:3000'));