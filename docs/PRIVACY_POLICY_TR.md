# FORGE Gizlilik Politikasi

Son guncelleme: 1 Temmuz 2026

FORGE; profil, hedef, beslenme, su ve antrenman kayitlarini kullanicinin cihazinda saklayan bir fitness takip uygulamasidir. Mevcut surumde hesap olusturma, bulut yedekleme veya gelistirici sunucusunda profil saklama bulunmaz.

## 1. Islenen bilgiler

Kullanici uygulamaya su bilgileri girebilir:

- ad
- yas
- cinsiyet
- boy
- kilo
- aktivite seviyesi
- istege bagli vucut olculeri
- hedef bilgileri
- ogun ve besin kayitlari
- su tuketimi
- antrenman planlari ve egzersiz kayitlari
- kullanicinin acikca sectigi yemek veya fizik analizi fotograflari
- AI tarafindan uretilen yaklasik kalori, makro ve fizik koc raporlari

Bu bilgiler kalori, makro, su ve antrenman ilerleme hesaplari icin cihaz uzerinde kullanilir.

AI Hub kayitlari ve analiz fotograflari kullanici kaydetmeyi sectiginde cihazda saklanir. Fizik analizi icin kullanicinin 18 yasindan buyuk oldugunu, fotograflarin kendisine ait oldugunu ve analize onay verdigini belirtmesi gerekir.

## 2. Harici servisler

Uygulamanin bazi ozellikleri harici servislerle veri alisverisi yapabilir:

- Besin aramasi kullanildiginda arama metni Open Food Facts servisine gonderilir.
- Egzersiz gorselleri egzersiz veri kaynagindan indirilebilir.
- Yemek gorseli arama ozelligi etkinlestirilmisse, ilgili servis ucuna yalnizca besin adi gonderilir.
- Kullanici AI Hub analizini baslattiginda secilen sikistirilmis fotograf veya fotograflar FORGE API rotasi uzerinden Google Gemini servisine gonderilir. Yemek analizinde bir, fizik analizinde on ve arka poz olmak uzere iki fotograf ayni analiz isteginde islenir.

AI analizi yaklasik bir fitness ve beslenme yardimidir; tibbi tani, tedavi veya kesin vucut yag olcumu degildir. FORGE bu fotograflari gelistiriciye ait kalici bir bulut arsivinde saklamaz. Google servisinin veri isleme kosullari ayrica gecerlidir.

Bu servislerin kendi gizlilik kosullari gecerlidir.

## 3. Bildirimler

Ogun, su ve antrenman hatirlatmalari cihaz uzerinde planlanan yerel bildirimlerdir. Kullanici bu hatirlatmalari ayarlardan acabilir, kapatabilir veya saatlerini degistirebilir.

## 4. Satin alma ve premium

Premium uyelik etkinlestirildiginde satin alma islemi App Store, Google Play ve RevenueCat altyapisi uzerinden yonetilir. Uygulama icinde kredi karti bilgisi tutulmaz. Satin alma durumunu dogrulamak icin magaza saglayicilarindan ve RevenueCat servisinden entitlement bilgisi alinabilir.

## 5. Saklama ve silme

Veriler cihazda saklanir. Profil ekranindaki **Profili sifirla** islemi profil, ogun, su, antrenman, favori, tercih, AI raporu ve AI analiz fotografi kayitlarini siler. AI Hub icindeki tekil silme islemi de ilgili raporu ve cihazdaki fotograflari kaldirir. Uygulamanin cihazdan kaldirilmasi yerel uygulama verilerini kaldirir.

## 6. Cocuklarin gizliligi

Uygulama 13 yasindan kucuk kisiler icin tasarlanmamistir.

## 7. Iletisim

Yayin oncesinde destek e-posta adresi bu belgeye ve magaza sayfasina eklenmelidir.
