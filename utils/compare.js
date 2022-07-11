module.exports = {
  compareStr: (str1, str2) => {
    if (str1 < str2) {
      return -1 // str1 before str2
    }
    if (str1 > str2) {
      return 1 // str1 after str2
    }
    return 0 // keep order
  },
}