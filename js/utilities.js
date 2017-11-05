function clamp(val, low, high) {
  if (val <= low) {
    val = low;
  }

  if (val >= high) {
    val = high;
  }

  return val;
}
