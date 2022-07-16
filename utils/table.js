const range = require('./range.js')
const defaultValue = require('./default-value.js')

const addDefaultTableSettings = ({
  firstVerticalSeparator,
  verticalSeparator,
  lastVerticalSeparator,
  
  firstHorizontalSeparator,
  horizontalSeparator,
  lastHorizontalSeparator,
  
  alignLeft,
  paddingChar,
}) => ({
  firstVerticalSeparator: defaultValue(firstVerticalSeparator, defaultValue(verticalSeparator, '| ')),
  verticalSeparator: defaultValue(verticalSeparator, ' | '),
  lastVerticalSeparator: defaultValue(lastVerticalSeparator, defaultValue(verticalSeparator, ' |')),

  firstHorizontalSeparator: defaultValue(firstHorizontalSeparator, defaultValue(horizontalSeparator, '-')),
  horizontalSeparator: defaultValue(horizontalSeparator, '-'),
  lastHorizontalSeparator: defaultValue(lastHorizontalSeparator, defaultValue(horizontalSeparator, '-')),

  alignLeft: !!defaultValue(alignLeft, true),
  paddingChar: defaultValue(paddingChar, ' '),
})

const normalizeCellData = (raw, settings) => {
  // create cellData object with defaults
  const cellData = {
    snippets: [],
    cellHeight: 0,
    cellWidth: 0,
    alignLeft: settings.alignLeft,
    paddingChar: settings.paddingChar,
  }
  
  if (typeof raw === 'string') {
    cellData.snippets = [raw]
  } else if (raw instanceof Array) {
    cellData.snippets = raw
  } else {
    if (!(raw.snippets instanceof Array)) {
      throw new Error(`cell data does not have snippets array`);
    }
    cellData.snippets = raw.snippets
    
    if (raw.alignLeft !== undefined) {
      cellData.alignLeft = !!raw.alignLeft
    }
    
    if (raw.paddingChar !== undefined) {
      cellData.paddingChar = raw.paddingChar
    }
  }
  
  cellData.cellHeight = cellData.snippets.length
  cellData.cellWidth = Math.max(...cellData.snippets.map((s) => s.length))
  
  return cellData
}

const createTable = (rows, columnGenerators, tableSettings = {}) => {
  const settings = addDefaultTableSettings(tableSettings)
  
  // first index => row
  // second index => column
  // { cellHeight, cellWidth, snippets, ... }
  const data = [];
  
  // index => column
  const maxWidth = Array(columnGenerators.length).fill(0)
  
  // index => row
  const maxHeight = Array(rows.length).fill(0)
  
  for (let r = 0; r < rows.length; r++) {
    const row = rows[r]
    
    data[r] = []
    
    for (let c = 0; c < columnGenerators.length; c++) {
      const columnGenerator = columnGenerators[c]
      
      const cellData = normalizeCellData(columnGenerator(row), settings)
      data[r][c] = cellData
      
      if (cellData.cellHeight > maxHeight[r]) {
        maxHeight[r] = cellData.cellHeight
      }
      
      if (cellData.cellWidth > maxWidth[c]) {
        maxWidth[c] = cellData.cellWidth
      }
    }
  }
  
  const repeatHorizontalSeparatorBase = (
    // sum up all column widths
    maxWidth.reduce((sum, w) => sum + w, 0) +
    // sum up all separator widths
    ((columnGenerators.length - 1) * settings.verticalSeparator.length) +
    settings.firstVerticalSeparator.length +
    settings.lastVerticalSeparator.length
  )
  
  const adjustRepeatHorizonalSeparatorBase = (separator) => {
    if (!separator) {
      return 0
    }
    
    return Math.ceil(repeatHorizontalSeparatorBase / separator.length)
  }
  
  const repeatHorizontalSeparator = adjustRepeatHorizonalSeparatorBase(settings.horizontalSeparator)
  const repeatFirstHorizontalSeparator = adjustRepeatHorizonalSeparatorBase(settings.firstHorizontalSeparator)
  const repeatLastHorizontalSeparator = adjustRepeatHorizonalSeparatorBase(settings.lastHorizontalSeparator)
  
  const rowStr = data
    .map((cols, r) => {
      return range(0, maxHeight[r] - 1)
        .map(l => {
          const lineStr = cols
            .map((cell, c) => {
              const snippet = cell.snippets[l] || ''
              if (cell.alignLeft) {
                return snippet.padEnd(maxWidth[c], cell.paddingChar)
              } else {
                return snippet.padStart(maxWidth[c], cell.paddingChar)
              }
            })
            .join(settings.verticalSeparator)
            
          return settings.firstVerticalSeparator + lineStr + settings.lastVerticalSeparator
        })
        .join(`\n`)
    })
    .join(settings.horizontalSeparator === null ? '\n' : `\n${settings.horizontalSeparator.repeat(repeatHorizontalSeparator)}\n`)
    
  return [
    settings.firstHorizontalSeparator === null ? '\n' : settings.firstHorizontalSeparator.repeat(repeatFirstHorizontalSeparator),
    rowStr,
    settings.lastHorizontalSeparator === null ? '\n' :settings.lastHorizontalSeparator.repeat(repeatLastHorizontalSeparator),
  ].join('\n')
}

module.exports = {
  createTable,
}
