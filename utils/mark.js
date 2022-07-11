const markFromStart = (str, markerPos) => {
  return str.slice(0, markerPos) + '(' + str.slice(markerPos, markerPos + 1) + ')' + str.slice(markerPos + 1)
}

const markFromEnd = (str, markerPos) => {
  return markFromStart(str, str.length - 1 - markerPos)
}

module.exports = {
  markFromStart,
  markFromEnd,
}