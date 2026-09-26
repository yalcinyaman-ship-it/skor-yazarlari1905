# Skor Yazarları — alev teması (tam paket)

Klasör yapısı repodakiyle aynı. Hepsini GitHub'da üzerine yaz:

| Dosya | Durum |
|---|---|
| index.html | değişti (yeni fontlar) |
| src/index.css | değişti (tema renkleri — TÜM eski ekranları otomatik boyar) |
| src/App.tsx | değişti (arka plan rengi) |
| src/pages/HomePage.tsx | değişti (yeni ana sayfa) |
| src/components/FlameHome.tsx | YENİ |
| src/components/AdminPanel.tsx | değişti (açık krem tema → koyu alev tema) |
| FixtureImporter.tsx | değişti (API maç havuzu, koyu tema) |
| src/UserProfileModal.tsx | değişti (yazar profili, koyu tema) |
| src/pages/PredictionPage.tsx | değişti (koyu tema) |

## Önemli
- Bu dosyalarda SADECE renk/font sınıfları değişti. Firebase okuma/yazma kodu, puan hesabı, API-Football kodu harfi harfine aynı.
- Tahmin penceresi, İstatistikler, Arşiv, Yönetici girişi gibi dokunulmayan dosyalar src/index.css'teki yeni tema sayesinde otomatik olarak alev renklerine geçer.
- Geri almak için GitHub'da bir önceki commit'e dönmen yeterli.
