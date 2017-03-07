# quickstart-minio
A get-started guide for using minio.  Documented with working code that you can easily run
anywhere on any computer that can run Docker.

## Running the quickstart
1.  Install [Docker](https://docs.docker.com/engine/installation/) and bash.  (Only Windows users need worry about bash).
2.  git clone this repository to a sandbox
3.  execute './quickstart'.  This will download and create any required docker images, and execute the example test code.

## minio
[minio](https://www.minio.io/) is a server written in Go that emulates Amazon's S3 functionality. This makes minio useful for testing S3 based functionality on your laptop without having to worry about network 
connectivity.  Bored on an airplane?  No problem, you can still write tests for your code.  You can never have enough tests.
Minio is also useful if you decide at some point in the future your business requirements don't include Amazon for some reason.

## Quickstart Philosophy
Ever look at online documentation for some service and say "WTF, there goes another week learning this!"?   Tired of examples that aren't complete, aren't tested, and thus don't actually work?  Tired of looking at Stackexchange and seeing incomplete examples?

Here's an attempt to solve this problem.  The idea of the quickstart series is to get someone who 
understands the basics of computer science and tools up and running really quickly on some complicated 
service that has inadequate documentation for noobs like you and me.

It's also a nice sandbox for submitting bugs to a service.  If you submit a working example of the code that's easy for the service to run, you will have a much higher chance of having the bug fixed.   Feel free to contribute bug tests.  Please link to the issue URL in a comment.   Same principle applies to Stack Overflow.

Working code beats documentation.

## Contribute!
The best person to write or update a quickstart guide is someone who has just learned the technology.

Please feel free to contribute issues and pull requests.  This quickstart is a great place to reproduce bugs as well, love to see some bug repros contributed.

I'll even take feedback on coding style. 

Please make sure all changes have tests that can run by anyone who has the basic dependencies of Docker and bash.

## Dependencies
The following is a list of dependencies to get this quickstart guide up and running. 

1. [Docker](https://docs.docker.com/engine/installation/).   This Docker installation guide is a great example of how
NOT to write docs.  Fortunetely running the installer is actually easy.  Just select community edition for your OS and 
run that installer.
2. Bash (to run the Docker comamnds).   Everyone except Windows users will have this by default.

Feel free to add a Powershell version as long as I can test it somehow on OSX and Linux.

Okay, I'm lying, you need a bit more than Docker and bash.   But the rest of the dependencies are handled by code you can
read and execute, not by hoping this README file is correct.

## Technology used
All this technology executes in the example but you don't have to worry about installing it and don't have to deal with it much until it comes time to write the code for your application.

1.  This quickstart guide is written in javascript/nodejs. To see the list of javascript modules please see the file package.json.
2.  Sorry mocha fans, I used tape, because [tape code looks far closer to final production](https://medium.com/javascript-scene/why-i-use-tape-instead-of-mocha-so-should-you-6aa105d8eaf4#.2qtk28u7t) code than mocha does.
3.  I use promises.  It's 2017, and if you learn javascript, you should probably have learned promises.  Feel free to make a quickstart-promises guide.  It should have lots of examples on anti-patterns...


