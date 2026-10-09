# Skor Yazarları — güvenlik + skor botu + geri sayım + JPEG

## 1) Dosyaları GitHub'a yükle (hepsinin üzerine yaz)
index.html · package.json · vercel.json · firestore.rules · FixtureImporter.tsx
api/ klasörü (fikstur.js, skor-guncelle.js, guvenlik-temizlik.js, _firebase.js)
src/index.css · src/App.tsx · src/UserProfileModal.tsx
src/pages/HomePage.tsx · src/pages/PredictionPage.tsx
src/components/FlameHome.tsx · src/components/AdminPanel.tsx

## 2) Sunucu anahtarı (bir kez, 3 dakika)
Skor botunun veritabanına yazabilmesi için:
1. Firebase Console → ⚙️ Proje ayarları → **Hizmet hesapları** → **Yeni özel anahtar oluştur** → bir .json dosyası iner.
2. Vercel → projen → Settings → **Environment Variables**
   - Ad: `FIREBASE_SERVICE_ACCOUNT`
   - Değer: indirdiğin .json dosyasının TÜM içeriği (kopyala-yapıştır)
3. Vercel → Deployments → son deploy → **Redeploy**.
Bu anahtarı kimseyle paylaşma, GitHub'a koyma.

## 3) Güvenlik temizliği (bir kez)
Tarayıcıda aç: `https://skor-yazarlari1905-19a6.vercel.app/api/guvenlik-temizlik?onay=evet`
→ "tamam: true" görmelisin. Açık PIN'ler ve eski API anahtarı silinir. Puan/tahmin etkilenmez.

## 4) Firebase kuralları
Firebase Console → Firestore → (ai-studio-… veritabanı) → **Kurallar** sekmesi.
ÖNCE mevcut metni bir yere kopyala (geri dönmek istersen). Sonra `firestore.rules` içeriğini yapıştır → **Yayınla**.
Sonuç: herkes okur; sadece yönetici yazar; yazarlar tahmini hafta yayınlanana kadar girebilir.

## 5) Skor botunu test et
`https://skor-yazarlari1905-19a6.vercel.app/api/skor-guncelle?zorla=evet`
→ "eslesen", "saat", "skor" sayıları görünür. "eslesmeyen" listesinde maç varsa takım adını bana yaz, eşleştirmeyi eklerim.
Bot, site her açıldığında (en fazla 8 dakikada bir) kendiliğinden çalışır.
İstersen cron-job.org'a ücretsiz üye olup bu adresi 15 dakikada bir çağırt — kimse siteyi açmasa da skorlar gelir.

## Neler oldu
- Maçları ELLE girmeye devam et. Bot takım adlarından ESPN'deki maçı bulup tarih/saat, logo ve biten maç skorunu doldurur. Elle girdiğin skora dokunmaz.
- Geri sayım: Özet'te "İlk düdüğe" sayacı. Sayaç yalnızca bilgi amaçlıdır; tahminler maç saatine göre kapanmaz, hafta yayınlanana kadar açık kalır.
- Yönetici girişi yapınca: Maçlar sekmesinde "Tahminleri JPEG indir", Puan Durumu'nda "Puan durumunu JPEG indir".
- Sefer için gömülü otomatik tahmin kodu silindi.
