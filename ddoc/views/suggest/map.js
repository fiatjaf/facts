function (fact) {
  var t = fact.triple

  emit([t[0], '_', null], t[1])
  emit([t[0], null, '_'], t[2])
  emit(['_', t[1], null], t[0])
  emit(['_', null, t[2]], t[1])
  emit([null, t[1], '_'], t[2])
  emit([null, '_', t[2]], t[1])

  emit([t[0], t[1], '_'], t[2])
  emit([t[0], '_', t[2]], t[1])
  emit(['_', t[1], t[2]], t[3])
}
