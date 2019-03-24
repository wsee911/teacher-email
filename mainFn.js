const pool = require('./sqlPool');
const {validateTeacherParam} = require('./teacherFn');
const {validateStudentParam} = require('./studentFn');
const {existUser, formatDBOutput} = require('./miscFn');

const commonStudents = async (req, res) => {
  try {
    let {teacher} = req.query;
    if(typeof teacher === `string`) {
      await validateTeacherParam(teacher);
    } else {
      teacher.forEach(async email => {
        await validateTeacherParam(email);
      });
    }
    const sql = `SELECT s.email FROM assigned_ts assign JOIN student s ON s.studentid = assign.studentid JOIN teacher t ON t.teacherid = assign.teacherid WHERE s.suspend = false AND t.email IN (?)`;
    const dbRes = await pool.query(sql, [teacher]);
    let students = formatDBOutput(dbRes);
    students = students.map(student => (student.email))
    res.status(200).send({students})
  } catch(err) {
    console.log(err);
    res.status(500).send({message:err.message});
  }
}

const isAssigned = async (teacherid, studentid) => {
  const sql = `SELECT assignid FROM assigned_ts WHERE teacherid = ? AND studentid = ?`;
  const dbRes = await pool.query(sql, [teacherid, studentid]);
  if(dbRes.length > 0) {
    return true;
  }
  return false;
}

const studentExist = async (student) => {
  const studentUser = await existUser(student, `student`);
  if(studentUser === false) {
    throw new Error(`Student ${student} not found`);
  }
  return studentUser.studentid;
}

const registerStudents = async (req, res) => {
  try {
    const {teacher, students} = req.body;
    if(typeof students !== `object`) {
      throw new Error(`Student parameter must be an array`);
    }
    await validateTeacherParam(teacher);
    let studentCheck = students.map(async email => {
      return await validateStudentParam(email);
    })
    await Promise.all(studentCheck);

    const teacherUser = await existUser(teacher, `teacher`);
    if(teacherUser === false) {
      throw new Error(`Teacher ${teacher} not found`);
    }
    const teacherId = teacherUser.teacherid;

    let studentIds = await students.map(studentExist)    
    studentIds = await Promise.all(studentIds);
    await studentIds.map(async student => {
      if(!await isAssigned(teacherId, student)) {
        const sql = `INSERT INTO assigned_ts (teacherid, studentid) VALUES (${teacherId}, ${student})`;
        const dbRes = await pool.query(sql);
        return dbRes.insertId
      }
    });
    res.status(204).send();
  } catch (err) {
    console.log(err)
    res.status(500).send({message:err.message});
  }
}

module.exports = {registerStudents, commonStudents};