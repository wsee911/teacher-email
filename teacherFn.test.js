const {validateTeacherParam} = require('./teacherFn');

test(`Makes Sure Teacher Email Correct`, async () => {
  expect(await validateTeacherParam(`test@test.com`)).toBeUndefined();
})

test(`Makes Sure Teacher Email Added`, async () => {
  try {
    await validateTeacherParam()
  } catch(err) {
    expect(err.message).toMatch(`Missing teacher's email`);
  }
})

test(`Makes Sure Teacher Email Format Correct`, async () => {
  const email = `test@.com`;
  try {
    await validateTeacherParam(email)
  } catch(err) {
    expect(err.message).toMatch(`${email} incorrect email format`);
  }
})