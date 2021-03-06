const path = require('path')
const { readJSON, isIgnoredMap, getEnemyName, toRates } = require('../utils')
const _ = require('lodash')

const emptyNML = {
  id: 0,
  materia1: 0,
  materia1Per: 0,
  materia2: 0,
  materia2Per: 0
}

const getChests = ({ stats, nmllist, itmlist }) => {
  const result = {}
  result.chest1ID = stats.drop_nml_per === 0 ? null : 'nml'
  result.chest1Per = toRates(stats.drop_nml_per)
  const nml = nmllist[stats.drop_nml - 1] || emptyNML
  if (nml.materia1 === nml.materia2) {
    result.chest1materia1ID = nml.materia1
    result.chest1materia1Per = toRates(nml.materia1Per, nml.materia2Per)
    result.chest1materia2ID = emptyNML.materia2
    result.chest1materia2Per = toRates(emptyNML.materia2Per)
  } else {
    result.chest1materia1ID = nml.materia1
    result.chest1materia1Per = toRates(nml.materia1Per)
    result.chest1materia2ID = nml.materia2
    result.chest1materia2Per = toRates(nml.materia2Per)
  }

  result.chest2ID = stats.drop_rar_per === 0 ? null : 'rar'
  result.chest2Per = toRates(stats.drop_rar_per)
  // get from rarlist
  result.chest3ID = stats.drop_spr_per === 0 ? null : 'spr'
  result.chest3Per = toRates(stats.drop_spr_per)
  // get from sprlist
  return result
}

const categoryMap = {
  0: 'Normal',
  2: 'Unique',
  4: 'Story',
  5: 'Story',
  6: 'Story',
  9: 'Story',
  10: 'Story',
  11: 'Story',
  12: 'Story',
  13: 'Story'
}

const getRows = async ({ bdat }) => {
  const [fldMapList] = [
    await readJSON(path.resolve(bdat, 'bdat_common', 'FLD_maplist.json'))
  ]

  const [enelist, enelistMs] = [
    await readJSON(path.resolve(bdat, 'bdat_common', 'BTL_enelist.json')),
    await readJSON(path.resolve(bdat, 'bdat_common_ms', 'BTL_enelist_ms.json'))
  ]

  let rows = await Promise.all(fldMapList.map(async map => {
    try {
      if (isIgnoredMap(map)) {
        return []
      }

      const idN = map.id_name.replace('ma', '')

      const [enelistStats, nmllist] = await Promise.all([
        readJSON(path.resolve(bdat, `bdat_${map.id_name}`, `BTL_enelist${idN}.json`)),
        readJSON(path.resolve(bdat, `bdat_${map.id_name}`, `drop_nmllist${idN}.json`))
      ])

      return enelistStats.map(stats => {
        const enemy = enelist[stats.id - 1]
        if (enemy.name === 0) {
          return null
        }

        const category = categoryMap[stats.named]
        if (!category) {
          console.warn('unknown category', { stats, map: map.id_name })
          return null
        }

        return {
          id: stats.id,
          name: getEnemyName({ enemy, enelistMs }).replace(' (Enemy)', '') + ' (Enemy Spawn)',
          enemy_name: getEnemyName({ enemy, enelistMs }),
          category: categoryMap[stats.named],
          level: stats.lv,
          hp: stats.hp,
          strength: stats.str,
          agility: stats.agi,
          ether: stats.ether,
          exp: stats.exp,
          spike_damage: stats.spike_dmg ? stats.spike_dmg : null,
          ...getChests({ stats, nmllist })
        }
      })
    } catch (error) {
      console.warn('failed', { map: map.id_name, error })
    }
  }))

  rows = rows.flat().filter(v => !!v)

  const nameCounts = _.countBy(rows, 'name')
  rows.forEach(row => {
    if (nameCounts[row.name] > 1) {
      row.name = row.name.replace('(Enemy Spawn)', `#${row.id} (Enemy Spawn)`)
    }
  })

  return rows
}

module.exports = {
  getRows
}
