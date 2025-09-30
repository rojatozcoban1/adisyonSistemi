const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // MySQL kullanıcı adın
    password: 'Rojhat.65',      // MySQL şifren
    database: 'adisyonsistemi_db'
});

db.connect((err) => {
    if(err){
        console.log('MySQL bağlantı hatası:', err);
    } else {
        console.log('MySQL bağlantısı başarılı!');
    }
});

module.exports = db;
