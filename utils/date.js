const fileDate = (dt) => `${dt.getFullYear()}-${String(dt.getMonth()).padStart(2, 0)}-${String(dt.getDate()).padStart(2, 0)}`

const fileTime = (dt) => `${String(dt.getHours()).padStart(2, 0)}-${String(dt.getMinutes()).padStart(2, 0)}-${String(dt.getSeconds()).padStart(2, 0)}`

const fileDateTime = (dt) => `${fileDate(dt)}_${fileTime(dt)}`

module.exports = {
  fileDate,
  fileTime,
  fileDateTime,
}
