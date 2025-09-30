// ------------------ Sayfa Geçiş ------------------
function showSection(id) {
    document.querySelectorAll('#content > div').forEach(div => div.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');

    if (id === 'masalar') listeleMasalar();
    if (id === 'siparisler') listeleUrunler();
    if (id === 'urunler') listeleUrunler2();
}

// ------------------ MASALAR ------------------
const API_MASALAR = 'http://localhost:5000/masalar';
function listeleMasalar() {
    const container = document.getElementById('masaContainer');
    container.innerHTML = '';
    for (let i = 1; i <= 30; i++) {
        const div = document.createElement('div');
        div.className = 'masa-card bos';
        div.innerText = `Masa ${i}`;
        div.onclick = () => {
            document.getElementById('masaNumara').innerText = i;
            showSection('siparisler');
        };
        container.appendChild(div);
    }
}

// ------------------ SİPARİŞLER ------------------
const API_URUNLER = 'http://localhost:5000/urunler';
let urunlerData = [];
let secilenUrunler = [];

async function listeleUrunler() {
    const tbody = document.querySelector('#siparisTable tbody');
    try {
        const res = await fetch(API_URUNLER);
        urunlerData = await res.json();

        const kategoriSelect = document.getElementById('kategoriSelect');
        kategoriSelect.innerHTML = '<option value="">Hepsi</option>';
        [...new Set(urunlerData.map(u => u.kategori))].forEach(k => {
            const option = document.createElement('option');
            option.value = k; option.innerText = k;
            kategoriSelect.appendChild(option);
        });

        filtreleUrunler();
    } catch (err) { console.error(err); }
}

function filtreleUrunler() {
    const secilenKategori = document.getElementById('kategoriSelect').value;
    const tbody = document.querySelector('#siparisTable tbody');
    tbody.innerHTML = '';

    urunlerData.filter(u => !secilenKategori || u.kategori === secilenKategori)
        .forEach(u => {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${u.isim}</td>
                        <td>${u.fiyat}₺</td>
                        <td><input type="number" min="0" value="0"></td>
                        <td>0₺</td>`;
            const input = tr.querySelector('input');
            input.onchange = () => {
                const index = secilenUrunler.findIndex(x => x.urun_id === u.id);
                if (input.value > 0) {
                    if (index === -1) secilenUrunler.push({ urun_id: u.id, adet: Number(input.value) });
                    else secilenUrunler[index].adet = Number(input.value);
                } else if (index !== -1) secilenUrunler.splice(index, 1);
                hesaplaToplam();
                tr.querySelector('td:last-child').innerText = `${u.fiyat * input.value}₺`;
            };
            tbody.appendChild(tr);
        });
}

function hesaplaToplam() {
    let toplam = 0;
    secilenUrunler.forEach(u => {
        const urun = urunlerData.find(x => x.id === u.urun_id);
        toplam += urun.fiyat * u.adet;
    });
    document.getElementById('toplamTutar').innerText = `Toplam: ${toplam}₺`;
}

async function siparisVer() {
    const masa_id = Number(document.getElementById('masaNumara').innerText);
    if (!masa_id) { alert('Masa seçin!'); return; }
    if (secilenUrunler.length === 0) { alert('Ürün seçin!'); return; }

    // Siparişi backend'e gönder
    const res = await fetch('http://localhost:5000/siparisler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masa_id, urunler: secilenUrunler })
    });
    const msg = await res.text();
    alert(msg);
    secilenUrunler = [];
    filtreleUrunler();

    // Masa durumunu "dolu" olarak güncelle
    await fetch(`http://localhost:5000/masalar/${masa_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durum: 'dolu' })
    });

    // Masalar ekranını yenile
    if (!document.getElementById('masalar').classList.contains('hidden')) listeleMasalar();
}

// ------------------ ÜRÜNLER ------------------
async function listeleUrunler2() {
    const container = document.getElementById('urunList2');
    container.innerHTML = '';
    const res = await fetch(API_URUNLER);
    const data = await res.json();
    data.forEach(u => {
        const div = document.createElement('div');
        div.className = 'urun-card';
        div.innerHTML = `<strong>${u.isim}</strong><br>${u.kategori}<br>${u.fiyat}₺`;
        container.appendChild(div);
    });
}

async function urunEkle() {
    const isim = document.getElementById('isim').value;
    const kategori = document.getElementById('kategori').value;
    const fiyat = Number(document.getElementById('fiyat').value);
    if (!isim || !kategori || !fiyat) { alert('Tüm alanları doldurun!'); return; }

    const res = await fetch(API_URUNLER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isim, kategori, fiyat, stok: 100 })
    });
    const msg = await res.text();
    alert(msg);
    document.getElementById('isim').value = '';
    document.getElementById('kategori').value = '';
    document.getElementById('fiyat').value = '';
    listeleUrunler2();
}
