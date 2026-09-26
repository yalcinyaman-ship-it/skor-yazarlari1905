# Skor Yazarları — yeni tasarım

GitHub'da şu 3 dosyayı değiştir / ekle (klasör yapısı aynı):

1. **index.html** → değiştir (sadece yeni fontlar eklendi: Anton, Barlow)
2. **src/pages/HomePage.tsx** → değiştir
3. **src/components/FlameHome.tsx** → YENİ dosya, ekle

## Ne değişti, ne değişmedi
- HomePage.tsx içindeki TÜM veri kodu (Firebase dinleyicileri, puan hesabı, sıralama) satırı satırına aynen korundu. Sadece ekrana çizen kısım FlameHome'a devredildi.
- Tahmin Yap penceresi, Yönetici girişi, Yönetici paneli, yazar profili ve arşiv pencereleri aynen çalışır.
- İstatistikler sekmesi mevcut Statistics bileşenini kullanır.
- Hiçbir veri silinmez, veritabanı yapısı değişmez.

## Geri almak istersen
GitHub'da commit geçmişinden bir önceki sürüme dönmen yeterli.
