Hacking-on-Azure
================

Code Camp Auckland 2014 talk. Demonstrating Azure by quickly building useful software to explore what is possible.

http://jukebox30.azurewebsites.net/

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

## Links
* [Microsoft Azure Storage SDK for Node.js](https://github.com/Azure/azure-storage-node)
* http://azure.microsoft.com/en-us/documentation/articles/storage-nodejs-how-to-use-table-storage/ - this is wrong! use from clause.
* [Best Practices for Designing a Pragmatic RESTful API](http://www.vinaysahni.com/best-practices-for-a-pragmatic-restful-api)
* [Writing an AngularJS App with an Express + Node.js Backend](http://briantford.com/blog/angular-express)
* [Customizing deployments - Kudu](https://github.com/projectkudu/kudu/wiki/Customizing-deployments)
WebJobs
* [Microsoft.Azure.WebJobs - Nuget](http://www.nuget.org/packages/Microsoft.Azure.WebJobs)
* [Microsoft.Azure.WebJobs.Core - Nuget](http://www.nuget.org/packages/Microsoft.Azure.WebJobs.Core)
* https://github.com/projectkudu/kudu/wiki/Web-jobs
* [possan/webapi-player-example (thirtify)](https://github.com/possan/webapi-player-example)
* http://socket.io/get-started/chat/
* http://www.w3schools.com/tags/ref_av_dom.asp

