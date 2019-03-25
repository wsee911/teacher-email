const {validateTeacherParam, createTeacher} = require('./teacherFn');

test(`Makes Sure Teacher Email Correct`, async () => {
  expect(await validateTeacherParam(`test@test.com`)).toBeNull();
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

test(`Makes Sure Teacher Email Exist`, async () => {   
  try {  
    await createTeacher(req)
  } catch(err) {
    expect(err.message).toMatch(`Teacher's email already exists`);
  }
})