# EscapeTable - Ubuntu 22 Deployment Talimatları

## 🚀 Production Deployment Guide
**Domain:** escape.toov.com.tr  
**Port:** 9344  
**Server:** Ubuntu 22.04

---

## 📋 Ön Hazırlık (Sunucuda)

### 1. Domain DNS Ayarı
```bash
# escape.toov.com.tr için A kaydı sunucu IP'nize yönlendirilmiş olmalı
# DNS propagation kontrolü:
nslookup escape.toov.com.tr
```

### 2. Firewall Ayarları
```bash
# Port 9344'ü açın (backend için)
sudo ufw allow 9344/tcp

# HTTP ve HTTPS portları (Nginx için)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# SSH (zaten açık olmalı)
sudo ufw allow 22/tcp

# Firewall durumunu kontrol edin
sudo ufw status
```

---

## 📦 Adım 1: Proje Dosyalarını GitHub'dan İndirin

```bash
# Sunucuya SSH ile bağlanın
ssh kullanıcı@sunucu-ip

# Proje dizini oluşturun
sudo mkdir -p /var/www/escapetable
sudo chown -R $USER:$USER /var/www/escapetable

# GitHub'dan klonlayın
cd /var/www
git clone https://github.com/j1vetr/EscapeTable.git escapetable

# Dizine girin
cd escapetable

# Dosyaları kontrol edin
ls -la
```

**Not:** Repo public olduğu için direkt clone edebilirsiniz. Git yüklü değilse:
```bash
sudo apt install git -y
```

---

## 🔧 Adım 2: Proje Kurulumu

```bash
cd /var/www/escapetable

# Node modules yükleyin (production için)
npm install --production=false

# TypeScript build yapın
npm run build

# Logs klasörü oluşturun (PM2 için)
mkdir -p logs

# .env dosyası oluşturun (ÖNEMLİ!)
nano .env
```

### .env Dosyası İçeriği
```env
NODE_ENV=production
PORT=9344

# PostgreSQL Database (Kendi bilgilerinizi girin)
DATABASE_URL=postgresql://kullanıcı:şifre@localhost:5432/escapetable

# Session Secret (Güçlü bir rastgele string)
SESSION_SECRET=super-gizli-random-string-buraya

# Domain (Production URL)
REPL_SLUG=escapetable
REPLIT_DOMAINS=escape.toov.com.tr
```

**Önemli:** SESSION_SECRET için güçlü bir rastgele string oluşturun:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 💾 Adım 3: PostgreSQL Database Hazırlama

```bash
# PostgreSQL'e bağlanın
sudo -u postgres psql

# Database ve kullanıcı oluşturun
CREATE DATABASE escapetable;
CREATE USER escapetable_user WITH PASSWORD 'güçlü-şifre-buraya';
GRANT ALL PRIVILEGES ON DATABASE escapetable TO escapetable_user;
\q

# Database şemasını oluşturun (Drizzle migration)
cd /var/www/escapetable
npm run db:push
```

---

## 🔄 Adım 4: PM2 ile Backend Başlatma

```bash
cd /var/www/escapetable

# PM2 ile başlatın
pm2 start ecosystem.config.cjs

# Durumu kontrol edin
pm2 status

# Logları görüntüleyin
pm2 logs escapetable

# PM2'yi sistem başlangıcına ekleyin
pm2 startup systemd
# Çıktıda verilen komutu çalıştırın (sudo env PATH=... ile başlayan)

# Mevcut PM2 durumunu kaydedin
pm2 save
```

### PM2 Yönetim Komutları
```bash
pm2 restart escapetable    # Yeniden başlat
pm2 stop escapetable       # Durdur
pm2 delete escapetable     # Sil
pm2 logs escapetable       # Logları izle
pm2 monit                  # Canlı monitoring
pm2 list                   # Tüm uygulamaları listele
```

---

## 🌐 Adım 5: Nginx Yapılandırması

```bash
# Nginx config dosyasını oluşturun
sudo nano /etc/nginx/sites-available/escapetable

# nginx-config-example.conf içeriğini buraya yapıştırın
# (Proje klasöründeki nginx-config-example.conf dosyasına bakın)

# Symlink oluşturun
sudo ln -s /etc/nginx/sites-available/escapetable /etc/nginx/sites-enabled/

# Nginx config testini yapın
sudo nginx -t

# Nginx'i yeniden başlatın
sudo systemctl reload nginx
```

---

## 🔒 Adım 6: SSL Sertifikası (Let's Encrypt)

```bash
# Certbot ile SSL sertifikası alın
sudo certbot --nginx -d escape.toov.com.tr -d www.escape.toov.com.tr

# Adımları takip edin:
# 1. Email adresinizi girin
# 2. Kullanım şartlarını kabul edin (A)
# 3. HTTP'den HTTPS'e yönlendirme yapılsın (2 - Redirect)

# SSL otomatik yenileme testi
sudo certbot renew --dry-run

# Sertifika durumunu kontrol edin
sudo certbot certificates
```

SSL sertifikası her 90 günde bir otomatik yenilenecek.

---

## ✅ Adım 7: Test ve Doğrulama

```bash
# Backend durumunu kontrol edin
pm2 status
curl http://localhost:9344/api/products

# Nginx durumunu kontrol edin
sudo systemctl status nginx

# Logları kontrol edin
pm2 logs escapetable --lines 50
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Browser'da Test
1. **HTTP Test:** http://escape.toov.com.tr
2. **HTTPS Test:** https://escape.toov.com.tr
3. **API Test:** https://escape.toov.com.tr/api/products
4. **Admin Panel:** https://escape.toov.com.tr/admin

---

## 🔄 Güncelleme Prosedürü

Kodda değişiklik yaptıktan sonra:

```bash
# Sunucuya SSH ile bağlanın
cd /var/www/escapetable

# Git'ten güncellemeleri çekin
git pull origin main

# Bağımlılıkları güncelleyin (gerekiyorsa)
npm install --production=false

# Yeniden build yapın
npm run build

# PM2'yi yeniden başlatın (zero-downtime)
pm2 reload escapetable

# Logları kontrol edin
pm2 logs escapetable
```

---

## 🐛 Sorun Giderme

### Backend Çalışmıyor (502 Bad Gateway)
```bash
# PM2 durumunu kontrol edin
pm2 status

# PM2 loglarını inceleyin
pm2 logs escapetable --lines 100

# Yeniden başlatın
pm2 restart escapetable

# Port 9344 dinleniyor mu?
sudo netstat -tlnp | grep 9344
```

### Database Bağlantı Hatası
```bash
# PostgreSQL çalışıyor mu?
sudo systemctl status postgresql

# Database URL doğru mu?
cat .env | grep DATABASE_URL

# Database'e manuel bağlanın
psql -U escapetable_user -d escapetable
```

### Nginx 404 Hatası (React Router)
```bash
# Nginx config'de try_files doğru mu?
sudo nano /etc/nginx/sites-available/escapetable

# location / {
#     try_files $uri $uri/ /index.html;
# }

sudo nginx -t
sudo systemctl reload nginx
```

### SSL Sertifikası Sorunu
```bash
# Sertifikayı manuel yenileyin
sudo certbot renew --force-renewal

# Nginx'i yeniden başlatın
sudo systemctl reload nginx
```

---

## 📊 Monitoring ve Bakım

### PM2 Monitoring
```bash
pm2 monit                    # Canlı monitoring
pm2 logs escapetable         # Log izleme
pm2 show escapetable         # Detaylı bilgi
```

### Disk Alanı Kontrolü
```bash
df -h                        # Disk kullanımı
du -sh /var/www/escapetable  # Proje boyutu
du -sh /var/log/nginx        # Nginx log boyutu
```

### Log Temizleme
```bash
# PM2 loglarını temizle
pm2 flush

# Nginx loglarını rotate et (otomatik yapılır)
sudo logrotate -f /etc/logrotate.d/nginx
```

---

## 🎯 Performans İyileştirmeleri

### 1. Nginx Gzip Compression (Zaten aktif)
Config'de gzip ayarları mevcut.

### 2. PM2 Cluster Mode
Daha fazla trafik için `ecosystem.config.cjs` içinde:
```javascript
instances: 2,  // veya 'max' (tüm CPU core'ları)
```

### 3. Database Connection Pooling
Drizzle ORM zaten connection pooling kullanıyor.

---

## 🔐 Güvenlik Önerileri

1. **Firewall:** Sadece gerekli portları açın (80, 443, 9344, 22)
2. **SSH:** Key-based authentication kullanın, root login kapatın
3. **Database:** Strong password kullanın, external access kapatın
4. **Updates:** Düzenli sistem güncellemeleri yapın
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
5. **Backups:** Database ve dosyaları düzenli yedekleyin
   ```bash
   pg_dump escapetable > backup-$(date +%Y%m%d).sql
   ```

---

## 📞 Yardım

Herhangi bir sorun olursa:
1. PM2 loglarına bakın: `pm2 logs escapetable`
2. Nginx loglarına bakın: `sudo tail -f /var/log/nginx/error.log`
3. System loglarına bakın: `sudo journalctl -xe`

**Deployment tamamlandı! 🎉**

Site artık https://escape.toov.com.tr adresinde yayında olmalı.
