const senderButton = document.getElementById('senderButton');
const receiverButton = document.getElementById('receiverButton');
const senderUI = document.getElementById('senderUI');
const receiverUI = document.getElementById('receiverUI');
const peerIdInput = document.getElementById('peerId');
const connectButton = document.getElementById('connectButton');
const textAreaSender = document.getElementById('textArea');
const textAreaReceiver = document.getElementById('textAreaReceiver');
const receiverIdDisplay = document.getElementById('receiverId');
const qrCodeElement = document.getElementById('qrCode');
const qrScannerElement = document.getElementById('qrScanner');

let peer, conn;

function initializePeer(role) {
    peer = new Peer();

    peer.on('open', id => {
        if (role === 'receiver') {
            receiverIdDisplay.innerText = id;
            qrCodeElement.innerHTML = '';
            new QRCode(qrCodeElement, {
                text: id,
                width: 128,
                height: 128
            });
        }
    });

    peer.on('connection', connection => {
        conn = connection;
        conn.on('open', () => {
            let isRemoteUpdate = false;
            showScr("whowill");

            conn.on('data', data => {
                if (data !== undefined) {
                    isRemoteUpdate = true;
                    handlemsg(data);
                    isRemoteUpdate = false;
                }
            });
        });
    });
}
let html5QrCode;

senderButton.addEventListener('click', () => {
    showScr("scanUI");
    initializePeer('sender');

    html5QrCode = new Html5Qrcode("qrScanner");
    html5QrCode.start(
        { facingMode: "environment" },
        {
            fps: 1,
            qrbox: 250
        },
        (decodedText) => {
            peerIdInput.value = decodedText;
            html5QrCode.stop();
        },
        (errorMessage) => {
            console.log(`QR Code error: ${errorMessage}`);
        }
    );
});

connectButton.addEventListener('click', () => {
    const receiverId = peerIdInput.value;

    if (html5QrCode) {
        html5QrCode.stop().catch(err => console.warn('Failed to stop QR scanner:', err));
    }

    if (receiverId) {
        conn = peer.connect(receiverId);
        conn.on('open', () => {
            console.log('Connection established with receiver');
            showScr("whowill");
        });

        conn.on('data', data => {
            if (data) {
                handlemsg(data)
            }
        });
    }
});


receiverButton.addEventListener('click', () => {
    showScr("qrUI");
    initializePeer('receiver');
});