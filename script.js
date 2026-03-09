const scriptURL = 'https://script.google.com/macros/s/AKfycbybqoyDHoyzg1rpOAP3RqmcVo-7c5j1LNJYN-vFGpinHJUjRpw01l6ALR1v5y4T-P5Hgg/exec';
let currentRole = '';

// Proteksi Hari Libur & Akhir Pekan
function isLibur() {
    const d = new Date();
    const day = d.getDay(); // 0 = Minggu, 6 = Sabtu
    const tgl = d.toISOString().split('T')[0];
    const hariLiburNasional = ["2026-03-11", "2026-03-25"]; // Tambah tanggal merah di sini
    
    return (day === 0 || day === 6 || hariLiburNasional.includes(tgl));
}

function showLoginForm(role) {
    currentRole = role;
    document.getElementById('role-selection').style.display = 'none';
    document.getElementById('form-input').style.display = 'block';
}

function verifyLogin() {
    const pass = document.getElementById('pass-input').value;
    const passAdmin = "admin123"; 
    const passPegawai = "camatsikur";

    if ((currentRole === 'admin' && pass === passAdmin) || (currentRole === 'pegawai' && pass === passPegawai)) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-app').style.display = 'flex';
        
        if(currentRole === 'admin') {
            document.getElementById('menu-rekap').style.display = 'block';
            document.getElementById('welcome-msg').innerText = "Anda login sebagai Administrator.";
        } else {
            document.getElementById('welcome-msg').innerText = "Selamat bekerja! Jangan lupa absen.";
            showSection('absensi');
        }
    } else {
        alert("Password Salah!");
    }
}

function showSection(id) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if(id === 'absensi') initScanner();
}

function initScanner() {
    const statusDiv = document.getElementById('status-hari');
    if (isLibur()) {
        statusDiv.innerHTML = "<b style='color:red;'>Akses Terkunci: Hari Libur/Weekend</b>";
        return;
    }
    statusDiv.innerHTML = "<b style='color:lightgreen;'>Sistem Aktif: Silakan Scan QR</b>";

    const html5QrCode = new Html5Qrcode("reader");
    html5QrCode.start(
        { facingMode: "environment" }, 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
            sendToSheets(decodedText);
            html5QrCode.stop();
        },
        (errorMessage) => {}
    );
}

function sendToSheets(id) {
    document.getElementById('result').innerText = "Mengirim...";
    fetch(scriptURL, { method: 'POST', mode: 'no-cors', body: JSON.stringify({ pegawaiID: id }) })
    .then(() => { alert("Absensi Berhasil!"); location.reload(); });
}

async function muatData() {
    const tbody = document.getElementById('data-body');
    tbody.innerHTML = "<tr><td colspan='3'>Memuat...</td></tr>";
    try {
        const res = await fetch(scriptURL + "?action=read");
        const data = await res.json();
        tbody.innerHTML = "";
        data.forEach(row => {
            tbody.innerHTML += `<tr><td>${row.waktu}</td><td>${row.pegawaiID}</td><td>Hadir</td></tr>`;
        });
    } catch (e) { tbody.innerHTML = "Gagal memuat data."; }
}