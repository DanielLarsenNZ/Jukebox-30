Hacking-on-Azure
================

Code Camp Auckland 2014 talk. Demonstrating Azure by quickly building useful software to explore what is possible.

### Getting started

* Register for a Spotify API Key.
* Install [NTVS](http://nodejstools.codeplex.com/) (optional)
* Install Azure Storage Emulator (optional if you have an Azure Storage Account)
* Create a [.env](https://github.com/scottmotte/dotenv) file "Jukebox\.env" and add your secret keys for the Spotify API, and optionally for Table Storage (or use the Storage emulator), e.g.

```
SpotifyApiClientId=abcdef1234567890
SpotifyApiClientSecret=abcdef1234567890
StorageAccountName=devstoreaccount1
StorageAccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==
StorageAccountTableStoreHost=127.0.0.1:10002
NewRelicLicenseKey=abcdef1234567890
```

* If you want to monitor the performance of your application with New Relic, sign up for the free New Relic add-on on the Azure portal and copy your license key to .env.

Then open PowerShell/Command prompt and run:

```
cd Jukebox
npm install
```
