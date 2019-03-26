const {validEmail, existUser, formatNotification} = require('./miscFn');

test(`Email has Valid Format`, async () => {
    expect(validEmail(`test@test.com`)).toBeTruthy()
})

test(`Email has Invalid Format`, async () => {
  expect(validEmail(`test@tetcom`)).toBeFalsy()
})

test(`Missing table parameter`, async () => {
  const email = `test@tst.com`;
  const table = ``;
  try {
    await existUser(email, table)
  } catch(err) {
    expect(err.message).toMatch(`Missing table name`);
  }
})

test(`User exist in table`, async () => {
  const email = `test@tst.com`;
  const table = `teacher`;
  expect(await existUser(email, table)).toBeDefined();
})

test(`User not exist in table`, async () => {
  const email = `test@test.com`;
  const table = `teacher`;
  expect(await existUser(email, table)).toBeFalsy();
})