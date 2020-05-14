const puppeteer = require('puppeteer');
// require('jest-fetch-mock').enableMocks()
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

test('expect to be logged out on launch', (async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(fetchDomain);
  const login = await page.$("#login")
  const signup = await page.$("#signup")

  expect(login).not.toBeNull()
  expect(signup).not.toBeNull()
  await browser.close();
}));

// test('expect to be logged out on launch', (async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto(fetchDomain + '/login');
//   await page.type('#email', 'test comment', {delay: 20})

//   const login = await page.$("#login")
//   const signup = await page.$("#signup")

//   expect(login).not.toBeNull()
//   expect(signup).not.toBeNull()
//   await browser.close();
// }));

// test('expect login page to render', (async () => {
//   const browser = await puppeteer.launch();
//   const page = await browser.newPage();
//   await page.goto("http://localhost:3000", {waitUntil: 'networkidle0'});
//   const login = await page.evaluate(
//     () => Array.from(
//       document.querySelectorAll('#responsive-navbar-nav > div.full-width.justify-content-end.navbar-nav > a:nth-child(2)'),
//       a => a.getAttribute('href')
//     )
//   );

//   const signup = await page.evaluate(
//     () => Array.from(
//       document.querySelectorAll('#responsive-navbar-nav > div.full-width.justify-content-end.navbar-nav > a:nth-child(3)'),
//       a => a.getAttribute('href')
//     )
//   );
//   expect(login[0]).toBe('/login')
//   expect(signup[0]).toBe('/signup')
//   await browser.close();
// }), 10000);