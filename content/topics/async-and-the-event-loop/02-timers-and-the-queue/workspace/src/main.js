const start = Date.now();

function stamp(label) {
  console.log(`${label} after ${Date.now() - start} ms`);
}

stamp("Study timer started");
