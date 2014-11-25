Jukebox30
================

Demo project, presentation and notes for a talk about quickly building a Jukebox web-app on Azure with Node.js and the Spotify Web API. 

### The talk

The talk is a deep-dive introductory session, suitable for experienced developers who may not yet have explored Node.js or Azure Websites in depth. 

I will be talking about building this project at these upcoming meetups:

* ~~Code Camp 2104~~
* ~~[Wellington .NET UG, October 29th 2014](http://www.meetup.com/WelliDotNet/events/207322862/)~~
* ~~[Ellerslie .NET UG, November 25th 2014](http://www.meetup.com/EllerslieDNUG/events/218406792/)~~


### The demo app

[http://jukebox30.azurewebsites.net/](http://jukebox30.azurewebsites.net/)

This is a proof of concept web-app for demonstration purposes. <a href="https://github.com/DanielLarsenNZ/Hacking-on-Azure/fork">Contributions</a>,
comments and <a href="https://github.com/DanielLarsenNZ/Hacking-on-Azure/issues">issues</a>
welcomed. <a href="https://github.com/DanielLarsenNZ/Hacking-on-Azure/blob/master/LICENSE">License</a> is MIT.

### Technologies used

[Node.js Tools for Visual Studio (NTVS)](http://nodejstools.codeplex.com/), 
<a href="http://azure.microsoft.com/en-us/services/websites/">Microsoft Azure Websites</a>, 
<a href="http://azure.microsoft.com/en-us/services/storage/">Azure Table and Queue Storage</a>, 
<a href="http://azure.microsoft.com/en-us/documentation/articles/websites-dotnet-webjobs-sdk-get-started/">Webjobs SDK</a>, 
the <a href="https://developer.spotify.com/web-api/">Spotify Web API</a>, <a href="http://nodejs.org/">Node.js</a>,
<a href="https://angularjs.org/">Angularjs</a>, <a href="http://getbootstrap.com/">Bootstrap</a>,
and <a href="http://socket.io/">socket.io</a>.


### Getting started

* [Register for a Spotify API Key](https://developer.spotify.com/my-applications/#!/).
* Install [NTVS](http://nodejstools.codeplex.com/) (optional)
* [Install Azure Storage Emulator](http://www.microsoft.com/en-nz/download/details.aspx?id=42317) (optional if you have an Azure Storage Account)
* Create a [.env](https://github.com/scottmotte/dotenv) file "Jukebox\.env" and add your secret keys for the Spotify API, and
optionally for Table Storage (or use the Storage emulator), e.g.

```
SpotifyApiClientId=abcdef1234567890
SpotifyApiClientSecret=abcdef1234567890
StorageAccountName=devstoreaccount1
StorageAccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==
StorageAccountTableStoreHost=127.0.0.1:10002
```

* git clone https://github.com/DanielLarsenNZ/Hacking-on-Azure.git
* Then open your favourite console and run:

```
cd Hacking-on-Azure\Jukebox.Web
npm install
```

* To run the app, in the same directory run `node app.js` _or_ run in Visual Studio using NTVS.

### Docs

See the wiki at https://github.com/DanielLarsenNZ/Hacking-on-Azure/wiki. 

### Questions, comments, issues

Message me on Twitter @DanielLarsenNZ or create an issue. Contributions to the project for new features or that help me to improve my code are
welcomed.

