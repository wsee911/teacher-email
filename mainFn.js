const pool = require('./sqlPool');
const {validateTeacherParam} = require('./teacherFn');
const {validateStudentParam, isSuspend} = require('./studentFn');
const {existUser, formatDBOutput, formatNotification} = require('./miscFn');

/**
 * Get students assigned to teacher
 * @param {string} teacher 
 */
const relatedStudents = async (teacher) => {
  const sql = `SELECT s.email FROM assigned_ts assign JOIN student s ON s.studentid = assign.studentid JOIN teacher t ON t.teacherid = assign.teacherid WHERE s.suspend = false AND t.email IN (?)`;
  const dbRes = await pool.query(sql, [teacher]);
  let students = formatDBOutput(dbRes);
  return students.map(student => (student.email))
}

/**
 * Get common students between teachers
 * @param {object} req 
 * @param {object} res 
 */
const commonStudents = async (req, res) => {
  try {
    let {teacher} = req.query;
    if(typeof teacher === `string`) {
      await validateTeacherParam(teacher);
    } else {
      let res = teacher.map(async email => {
        return await validateTeacherParam(email);
      });
      await Promise.all(res);
    }
    
    let sql = `SELECT s.email FROM assigned_ts assign JOIN student s ON s.studentid = assign.studentid JOIN teacher t ON t.teacherid = assign.teacherid WHERE t.email IN (?) GROUP BY assign.studentid HAVING COUNT(assign.studentid) > 1`;
    if(typeof teacher === `string`) {
      sql = `SELECT s.email FROM assigned_ts assign JOIN student s ON s.studentid = assign.studentid JOIN teacher t ON t.teacherid = assign.teacherid WHERE t.email IN (?)`;
    }
    const dbRes = await pool.query(sql, [teacher]);
    let students = formatDBOutput(dbRes);
    students = students.map(student => (student.email))
    res.status(200).send({students})
  } catch(err) {
    console.log(err);
    res.status(500).send({message:err.message});
  }
}

/**
 * If student has been assigned
 * @param {int} teacherid 
 * @param {int} studentid 
 */
const isAssigned = async (teacherid, studentid) => {
  const sql = `SELECT assignid FROM assigned_ts WHERE teacherid = ? AND studentid = ?`;
  const dbRes = await pool.query(sql, [teacherid, studentid]);
  if(dbRes.length > 0) {
    return true;
  }
  return false;
}

/**
 * Assigns students to specified teacher
 * @param {object} req 
 * @param {object} res 
 */
const registerStudents = async (req, res) => {
  try {
    // validate input
    const {teacher, students} = req.body;
    if(typeof students !== `object`) {
      throw new Error(`Student parameter must be an array`);
    }
    await validateTeacherParam(teacher);
    let studentCheck = students.map(async email => {
      return await validateStudentParam(email);
    })
    await Promise.all(studentCheck);
    
    // checks if teacher exists
    const teacherUser = await existUser(teacher, `teacher`);
    if(teacherUser === false) {
      throw new Error(`Teacher ${teacher} not found`);
    }
    const teacherId = teacherUser.teacherid;
    
    // checks if student exists
    let studentIds = await students.map(async (student) => {
      const studentUser = await existUser(student, `student`);
      if(studentUser === false) {
        throw new Error(`Student ${student} not found`);
      }
      return studentUser.studentid;
    })    
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

/**
 * Verifies and extracts recipients and message from notification
 * @param {object} req 
 * @param {object} res 
 */
const retrieveNotifications = async (req, res) => {
  try {
    // validate input
    let {teacher, notification} = req.body;
    if(typeof teacher === `string`) {
      await validateTeacherParam(teacher);
    } else {
      teacher.forEach(async email => {
        await validateTeacherParam(email);
      });
    }
    // checks if teacher exists
    const teacherUser = await existUser(teacher, `teacher`);
    if(teacherUser === false) {
      throw new Error(`Teacher ${teacher} not found`);
    }
    let recipients = [];
    const {message, students} = await formatNotification(notification);
    if(students.length > 0) {
      // checks if student exists
      let checkedStudents = await students.map(student => (existUser(student, `student`))); 
      checkedStudents = await Promise.all(checkedStudents);
      await checkedStudents.map(student => {
        if(student === false) {
          throw new Error(`There are students not found`)
        }
      })
      recipients = await relatedStudents(teacher);
      
      // checks if student suspended
      let notSuspendStudents = checkedStudents.map(async studentid => {
        let student = await isSuspend(studentid)
        if(student) {
          return student.email;
        }
        return null;
      }) 
      notSuspendStudents = await Promise.all(notSuspendStudents);
      recipients = recipients.concat(notSuspendStudents);
      recipients = await recipients.filter(email => (email!==null))
      recipients = Array.from(new Set(recipients));
    } else {
      // runs if no recipients specified
      recipients = await relatedStudents(teacher);
    }   
    res.status(200).send({recipients})
  } catch(err) {
    console.log(err);
    res.status(500).send({message:err.message});
  }
}

module.exports = {registerStudents, commonStudents, retrieveNotifications};