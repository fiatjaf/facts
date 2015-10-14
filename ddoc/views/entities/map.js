function (fact) {
  emit([fact.triple[0], fact.triple[1]], fact.triple[2])
  emit([fact.triple[2], fact.triple[1], true /* reverse prop */], fact.triple[2])
}
