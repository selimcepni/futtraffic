# İki kameralı maç stüdyosu

Windows için WSL2/Ubuntu içinde Git, Python 3 ve python3-venv kurulu olmalı. Maç işçisi Linux dosya kilitleri kullanır. Klonlama ve ilk çalıştırma:

```bash
git clone --branch codex/iki-kamera-studyo https://github.com/selimcepni/futtraffic.git
cd futtraffic
bash saha-baslat.sh
```

Windows'ta WSL2/Ubuntu ve python3-venv hazırsa klasördeki Saha-Studio.cmd de aynı başlatıcıyı çalıştırır.

Tarayıcıda http://127.0.0.1:8000/studyo/ adresini aç. İlk kurulum RF-DETR ve PyTorch indirir. Kayıtları Kamera A ve Kamera B altında seç. Dosyalar yerel API'ye aktarılır. Bir yükleme sırasında sayfa kapanırsa önce kayıt seçicisinde tamamlanmış kayıtları kontrol et. Analiz süresi donanıma bağlıdır.

Her açıyı aynı gerçek saha koordinatlarına göre kalibre et. Zemin üzerindeki bir köşeyi başlangıç kabul et, X'i uzunluk boyunca, Y'yi genişlik boyunca ölç. En az dört farklı ve sahaya yayılmış nokta kullan. Eğri görünen çizgiler için tek perspektif dönüşümü yaklaşık sonuç verir. Ek bir ölçülü çizgiyle kontrol et. Otomatik kalibrasyon kullanılmışsa halı saha ölçülerini ayrıca doğrula.

Her iki videoyu aynı olayda durdur ve **Bu iki anı eşleştir** düğmesine bas. Ofset sabittir. Maç sonundaki ortak pozisyonda saatin kaydığını görürsen ilgili bölüm için yeniden eşleştir.

Takip kartlarını işaretle, futbolcuyu kadrodan seç ve ata. Aynı futbolcunun diğer açıdaki veya kopmuş takibini de seçebilirsin. İsimleri, kamera çiftlerini, eşleme ve atamaları bu tarayıcı kendi yerel deposunda saklar. Kamera sırası önemlidir. Ana Fut Traffic kadrosu ve dışa aktarımları bu stüdyo atamalarını henüz kullanmaz.

Her futbolcu kartında **Ölçüm** seçicisi bir takip kaydının doğrulanabilen ölçümlerini gösterir. Süre gözlenen dakikadır. Isı haritası ve yaklaşık mesafe aynı kaynaktan gelir. İki kameranın çakışan süreleri toplanmaz. Tüm takip parçalarını birleştirerek maç toplamı hesaplama bu sürümün kapsamı dışındadır.
