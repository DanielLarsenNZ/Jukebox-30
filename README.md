Hacking-on-Azure
================

Code Camp Auckland 2014 talk. Demonstrating Azure by quickly building useful software to explore what is possible.

### Getting started

* Install [NTVS](http://nodejstools.codeplex.com/) (optional)
* Install Azure Storage Emulator (optional if you have an Azure Storage Account)
* Create a [.env](https://github.com/scottmotte/dotenv) file "Jukebox\.env" and add your secret keys for the Spotify API, and optionally for Table Storage (or use the Storage emulator), e.g.

```
SpotifyApiClientId=abcdef1234567890
SpotifyApiClientSecret=abcdef1234567890
StorageAccountName=devstoreaccount1
StorageAccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==
StorageAccountTableStoreHost=127.0.0.1:10002

```

Then open PowerShell/Command prompt and run:

```
cd Jukebox
npm install
```
