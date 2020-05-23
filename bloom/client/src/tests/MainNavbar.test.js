const puppeteer = require('puppeteer');
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

// test('expect correct navbar on login', (async () => {
//   const browser = await puppeteer.launch({
//     headless: false,
//     slowMo: 80,
//     defaultViewport: null
//   });
//   const page = await browser.newPage();
//   await page.goto("localhost:3000" + '/login');
//   await page.type('#email', '123@123.com', {delay: 20})
//   await page.type('#password', '123123', {delay: 20})

//   const response = {
//     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NywiZmlyc3RfbmFtZSI6IkJpbGx5IiwibGFzdF9uYW1lIjoiU21pdGgiLCJpYXQiOjE1ODk1OTA3OTksImV4cCI6MTU4OTY3NzE5OX0.sjjgpA4r1EUpjgWzKIDvhzWOnX2hmFxM77qCppwHSuc",
//     user: {
//     created_at: "2020-05-02 07:34:41",
//     email: "123@123.com",
//     first_name: "Billy",
//     id: 7,
//     last_name: "Smith",
//     phone: "123123123",
//     provider: null,
//     role: "2",
//     services: null,
//     store_id: 35,
//     worker_id: 16,
//     }
//   }

//   await page.click("#submit")
//   await page.waitForNavigation({ waitUntil: 'networkidle0' })
  
//   // await browser.close();
// }), 1000000);