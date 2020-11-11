![Episerver](https://ux.episerver.com/images/logo.png)
# Foundation SPA React: Core Library  <!-- omit in toc -->
This library contains the core functionality for the Episerver Foundation React based SPA. For a full example project based upon this library head over to [Foundation Spa React](https://github.com/episerver/Foundation-spa-react).

You can request a demo of the project by one of our Episerver experts on [Get a demo](https://www.episerver.com/get-a-demo/).

[![License](https://img.shields.io/:license-apache-blue.svg?style=flat-square)](http://www.apache.org/licenses/LICENSE-2.0.html)
![Typescript](https://img.shields.io/npm/types/typescript?style=flat-square)
***

## Table of Contents  <!-- omit in toc -->
- [1. Introduction](#1-introduction)
- [2. Installation](#2-installation)
- [3. Usage](#3-usage)
- [4. Known issues](#4-known-issues)

***

## 1. Introduction 
This library contains the core functionality for the Episerver Foundation React based SPA. It covers the following capabilities:

- Application configuration
- Service container
- Extension/module loading
- Routing
- Component loading
- Episerver Model synchronization

## 2. Installation
**The TL;DR:**

Install latest master version from GitHub
```
npm install --save @reduxjs/toolkit axios core-js dotenv eventemitter3 lodash react react-dom react-helmet react-redux react-router react-router-dom redux

npm install --save-dev @types/core-js @types/eventemitter3 @types/lodash @types/react @types/react-dom @types/react-helmet @types/react-redux @types/react-router @types/react-router-dom

npm install --save git+https://github.com/episerver/foundation-lib-spa-core.git
```

**Full instructions**

Install the latest master version directly from GitHub:
```
npm install --save git+https://github.com/episerver/foundation-lib-spa-core.git
```

It is also possible to directly install the latest commit on a branch (e.g. Develop) or a Tag (e.g. Released version). Use the command below and replace REFID with the identifier of the Git commit that you want to use.
```
npm install --save git+https://github.com/episerver/foundation-lib-spa-core.git#REFID
```


The library has been optimized for usage with Webpack and the Webpack companion scripts. Although strictly spoken optional it's highly recommended to use Webpack for build and delivery.

Make sure that your project provides the required peer dependencies for the library to work. If you're using TypeScript, make sure to install type definitions (@types/...) for the libraries as well.

| Dependency | Version | Installation |
| --- | --- | --- |
|@reduxjs/toolkit|^1.3.6|`npm install --save @reduxjs/toolkit`|
|axios|^0.20.0|`npm install --save axios`|
|core-js|^3.6.5|`npm install --save-prod core-js`<br>`npm install --save-dev @types/core-js`|
|dotenv|^8.2.0|`npm install --save dotenv`|
|eventemitter3|^4.0.7|`npm install --save eventemitter3`<br>`npm install --save-dev @types/eventemitter3`|
|lodash|^4.17.19|`npm install --save lodash`<br>`npm install --save-dev @types/lodash`|
|react|^16.13.1|`npm install --save react`<br>`npm install --save-dev @types/react`|
|react-dom|^16.13.1|`npm install --save react-dom`<br>`npm install --save-dev @types/react-dom`|
|react-helmet|^6.0.0|`npm install --save react-helmet`<br>`npm install --save-dev @types/react-helmet`|
|react-redux|^7.2.1|`npm install --save react-redux`<br>`npm install --save-dev @types/react-redux`|
|react-router|^5.2.0|`npm install --save react-router`<br>`npm install --save-dev @types/react-router`|
|react-router-dom|^5.2.0|`npm install --save react-router-dom`<br>`npm install --save-dev @types/react-router-dom`|
|redux|^4.0.5|`npm install --save redux`|

Or install all dependencies in one go, using the following two commands:


*Install  dependencies*
```
npm install --save @reduxjs/toolkit axios core-js dotenv eventemitter3 lodash react react-dom react-helmet react-redux react-router react-router-dom redux
```

*Install TypeScript type definitions*
```
npm install --save-dev @types/core-js @types/eventemitter3 @types/lodash @types/react @types/react-dom @types/react-helmet @types/react-redux @types/react-router @types/react-router-dom
```

## 3. Usage
Please check [Foundation Spa React](https://github.com/episerver/Foundation-spa-react) to see a full example implementation using this library.

## 4. Known issues
All issues for this library are tracked through GitHub issues. The following issues/design flaws are known but are not planned to be resolved in the short term.

- Although required as production dependency it contains development only binaries. These *should* be split into a separate development library. 
- The "server side rendering only" scripts are included in this framework. These *should* be split into a server side rendering library.