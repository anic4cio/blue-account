# Blue Account 💙
Simple application to auto-download many files in a website and compress it to send it to our corporative environment.

### Techs
* Typescript
* NodeJs
* Archiver
* Puppeteer

### How does it work?
* Inside src dir, has a file named `install-mouse-helper.js` and it's used to watch mouse pointer working when headless is false
* The application set the download path to `./invoices`
* The Archiver module will compress the folder after all downloads was finnished
* Finnaly the Archiver will come up with `invoices.zip` file
* We can watch Puppeteer working setting `{ headless: false }` option when instancing a new browser
(This option **IS NOT** recommended when application is running in production, it's only a way to develop your code easier)
* The application would crash at any moment, because depends on Conta Azul page updates.
* The better way to make this reliable is getting all buttons by its selector values. But it's a challenge! (Challenge passed!)

### How to run this?
1. Clone this repository
2. Run `npm ci`
3. Run `npm run build` to transpile codes to typescript
4. Run `npm run start` to starts the application
