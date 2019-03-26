const {validateStudentParam} = require('./studentFn');

test(`Makes Sure Student Email Correct`, async () => {
  expect(await validateStudentParam(`test@test.com`)).toBeUndefined();
})

test(`Makes Sure Student Email Added`, async () => {
  try {
    await validateStudentParam()
  } catch(err) {
    expect(err.message).toMatch(`Missing student emails`);
  }
})

test(`Makes Sure Student Email Format Correct`, async () => {
  const email = `test@.com`;
  try {
    await validateStudentParam(email)
  } catch(err) {
    expect(err.message).toMatch(`${email} incorrect email format`);
  }
})