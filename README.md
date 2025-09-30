Adisyon Sistemi

Bu proje, restoran ve kafeler için adisyon yönetimi sağlayan bir web uygulamasıdır. Sistem, masa yönetimi, sipariş yönetimi ve ürün yönetimi özelliklerini içerir.

Özellikler

Masaları görüntüleme ve durumlarını yönetme (boş/dolu)

Sipariş oluşturma, detaylarını görme ve sipariş durumunu güncelleme

Ürün ekleme, listeleme ve stok yönetimi

Basit ve kullanıcı dostu arayüz

Teknolojiler

Frontend: HTML, CSS, JavaScript

Backend: Node.js, Express.js

Veritabanı: MySQL

Kurulum ve Çalıştırma

Projeyi klonlayın:

git clone https://github.com/rojatozcoban1/adisyonSistemi.git
cd adisyonSistemi


Gerekli Node.js paketlerini yükleyin:

npm install


MySQL veritabanını oluşturun ve tabloları ekleyin:

CREATE DATABASE adisyonsistemi_db;
USE adisyonsistemi_db;

-- Tablolar: kullanicilar, masalar, urunler, siparisler, siparis_detay
-- (Tablo yapısı README içinde veya db.sql dosyasında mevcut)


Backend’i başlatın:

nodemon server.js


Frontend’i açın:

Tarayıcıda ana_menu.html veya diğer HTML dosyalarını açarak test edin.

Dosya Yapısı
adisyonSistemi/
│
├── server.js         # Backend sunucu kodu
├── db.js             # MySQL bağlantısı
├── package.json
├── ana_menu.html     # Ana menü ekranı
├── masa_ekran.html   # Masalar ekranı
├── siparis_ekran.html # Sipariş ekranı
├── urunler.html      # Ürünler ekranı
├── app.js            # Frontend JS
└── README.md

Kullanım

Ana menüden Masalar, Siparişler ve Ürünler sayfalarına geçiş yapılabilir.

Masalara tıklayarak sipariş oluşturabilir ve durumunu değiştirebilirsiniz.

Ürünler sayfasında yeni ürün ekleyebilir, mevcut ürünleri listeleyebilirsiniz.
