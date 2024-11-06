// Function to show the QR code section and hide the pairing code section
function chooseQR() {
    document.getElementById('qr-container').style.display = 'block';
    document.getElementById('pairing-container').style.display = 'none';

    // Make a request to the server to generate and display the QR code
    fetch('/generate-qr')
        .then((response) => response.text())
        .then((data) => {
            const qrImage = document.getElementById('qr-image');
            qrImage.src = `data:image/png;base64,${data}`;
        })
        .catch((error) => {
            console.error('Error fetching QR code:', error);
        });
}

// Function to show the pairing code section and hide the QR code section
function choosePairing() {
    document.getElementById('pairing-container').style.display = 'block';
    document.getElementById('qr-container').style.display = 'none';
}

// Function to handle the submission of the phone number for pairing
function submitPairingCode() {
    const phoneNumber = document.getElementById('phoneNumber').value;

    if (!phoneNumber) {
        alert("Please enter a phone number.");
        return;
    }

    // Make a request to the server to generate the pairing code
    fetch(`/generate-pairing?phone=${encodeURIComponent(phoneNumber)}`)
        .then((response) => response.text())
        .then((data) => {
            document.getElementById('pairing-code').innerText = data;
        })
        .catch((error) => {
            console.error('Error generating pairing code:', error);
            document.getElementById('pairing-code').innerText = 'Error generating pairing code.';
        });
}
