# Quick Start for Interface Development

Building an interface for ACAEngine is the same as building any generic web application.
We try to follow industry best practices and leverage the tools used by most developers in the industry.

* NOTE:: Windows users, it is recommended that you install the [Linux subsystem for Windows](https://msdn.microsoft.com/en-au/commandline/wsl/install_guide).
  * Tools such as git and your preferred text editor make sense to run on Win32
  * Whilst both NodeJS and Ruby can run naitively on Windows they are much harder to manage and use effectively when compared to their linux counterparts.


## What you will need

Please install the following applications as they are core requirements for interface development

1. [git](https://git-scm.com/) - version control
1. A text editor
  * [Sublime Text](https://www.sublimetext.com/)
  * [Atom](https://atom.io/)
  * [Visual Studio Code](https://code.visualstudio.com/)
  * [Font Ligatures](https://github.com/tonsky/FiraCode) are cool
1. [NodeJS](https://nodejs.org/) - development platform
1. [Ruby](https://rvm.io/rvm/install)


## Install some core tools

Many of the tools and libraries that help with development are available via `npm` which is the [Node Package Manager](https://www.npmjs.com/).
We recommend installing the following command line helpers

* [Angular CLI](https://cli.angular.io/) `npm install -g @angular/cli`
* [Gulp](https://gulpjs.com/) `npm install --global gulp-cli`


## Running the Demo UI

This is a project that can be cloned and run against the ACAEngine development environment.
For those who want some instant gratification.

1. Create a folder for storing your interface projects
1. Open a command prompt at that location
1. Clone the [Demo UI](https://github.com/acaprojects/demo-ui) `git clone https://github.com/acaprojects/demo-ui.git`
1. `cd demo-ui` to move into the folder
1. `npm install` to install the project dependencies
1. `gulp serve` to run the development server


## Angular Resources

Angular is our preferred web application framework. We recommend being familiar with it before continuing.

* https://angular.io/guide/quickstart - for a basic understanding of Angular applications
* https://angular.io/tutorial - fundamentals of Angular


## Updating your environment

This will keep you running on the latest version of the platform as there are periodic updates.

* Updating NPM: `npm install npm@latest -g`
* Updating NodeJS (Windows users should download the latest MSI, unless using the Linux subsystem)
  * `sudo npm cache clean -f`
  * `sudo npm install -g n`
  * `sudo n stable`
