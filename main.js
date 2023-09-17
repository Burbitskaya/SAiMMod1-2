document.getElementById("compute").onclick = computeChart;
const k = 20;
const n = 1000000;
let mo;
let r;
let a;
let m;
let addedElements = [];

let aU, b;
let mx, sx;
let ly, ny;

function selectOnChange(object) {
  let value = object.value;
  addedElements.forEach((value) => document.getElementById(value).remove());
  addedElements = new Array();
  switch (value) {
    case "1": {
      let htmlA =
        '<label for="aU">a: </label><input type="text" id="aU" value="5"/>' +
        '<label for="b">b: </label><input type="text" id="b" value="14"/>';

      document.getElementById("lab2").insertAdjacentHTML("beforeend", htmlA);
      addedElements.push("htmlA", "htmlB");
      break;
    }
    case "2": {
      let htmlA =
        '<div id="htmlMx">Mx: <input type="text" id="mx" value="5"/></div>' +
        '<div id="htmlSx">Sx: <input type="text" id="sx" value="5"/></div>';

      document.getElementById("lab2").insertAdjacentHTML("beforeend", htmlA);
      addedElements.push("htmlMx", "htmlSx");
      break;
    }
    case "3": {
      let htmlA =
        '<div id="htmlLy">Ly: <input type="text" id="ly" value="14"/></div>';

      document.getElementById("lab2").insertAdjacentHTML("beforeend", htmlA);
      addedElements.push("htmlLy");
      break;
    }
    case "4": {
      let htmlA =
        '<div id="htmlLy">Ny: <input type="text" id="ny" value="5"/></div>' +
        '<div id="htmlNy">Ly: <input type="text" id="ly" value="10"/></div>';

      document.getElementById("lab2").insertAdjacentHTML("beforeend", htmlA);
      addedElements.push("htmlLy", "htmlNy");
      break;
    }
    case "5":
    case "6": {
      let htmlA =
        '<div id="htmlA">A: <input type="text" id="aU" value="5"/></div>' +
        '<div id="htmlB">B: <input type="text" id="b" value="14"/></div>';

      document.getElementById("lab2").insertAdjacentHTML("beforeend", htmlA);
      addedElements.push("htmlA", "htmlB");
      break;
    }
  }
}

function computeChart() {
  //todo check for negative values, don't allow them
  a = parseInt(document.getElementById("a").value, 10);
  m = parseInt(document.getElementById("m").value, 10);
  r = parseInt(document.getElementById("r0").value, 10);
  let distribution = document.getElementById("distribution").value;
  let distributionFunction, estimateFunction;

  switch (distribution) {
    case "0": {
      let result = algorithmLemera(a, m, n);

      drawChart(result);
      findMO(result);
      findDispersion(result);
      findK(result);
      let p = findP(result);
      findL(result, p);
      break;
    }
    case "1": {
      aU = parseInt(document.getElementById("aU").value, 10);
      b = parseInt(document.getElementById("b").value, 10);

      distributionFunction = uniformDistribution;
      estimateFunction = estimateUniformDistribution;
      break;
    }
    case "2": {
      mx = parseInt(document.getElementById("mx").value, 10);
      sx = parseInt(document.getElementById("sx").value, 10);

      distributionFunction = gaussianDistribution;
      estimateFunction = estimateGaussianDistribution;
      break;
    }
    case "3": {
      ly = parseInt(document.getElementById("ly").value, 10);

      distributionFunction = exponentialDistribution;
      estimateFunction = estimateExponentialDistribution;
      break;
    }
    case "4": {
      ly = parseInt(document.getElementById("ly").value, 10);
      ny = parseInt(document.getElementById("ny").value, 10);

      distributionFunction = gammalDistribution;
      estimateFunction = estimateGammalDistribution;
      break;
    }
    case "5": {
      aU = parseInt(document.getElementById("aU").value, 10);
      b = parseInt(document.getElementById("b").value, 10);

      distributionFunction = triangleDistribution;
      estimateFunction = estimateGaussianDistribution;
      break;
    }
    case "6": {
      aU = parseInt(document.getElementById("aU").value, 10);
      b = parseInt(document.getElementById("b").value, 10);

      distributionFunction = simpsonDistribution;
      estimateFunction = estimateSimpsonDistribution;
      break;
    }
  }

  let result = [];
  for (let i = 0; i < n; i++) {
    result[i] = distributionFunction();
  }
  estimateFunction(result);
  drawChart(result);
}

function uniformDistribution() {
  let R1 = getLemeraElement();
  return aU + (b - aU) * R1;
}

function estimateUniformDistribution() {
  let Mx = (aU + b) / 2;

  let Dx = Math.pow(b - aU, 2) / 12;
  setValues(Mx, Dx, Math.pow(Dx, 1 / 2));
}

function gaussianDistribution() {
  let r_arr = [];
  for (let i = 0; i < 12; i++) {
    r_arr.push(getLemeraElement());
  }
  let sum = r_arr.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);
  return mx + sx * (sum - 6);
}

function estimateGaussianDistribution(values) {
  let Mx = 0,
    Dx = 0;

  for (let i = 0; i < n; i++) {
    Mx += values[i];
  }
  Mx /= n;
  for (let i = 0; i < n; i++) {
    Dx += Math.pow(values[i] - Mx, 2);
  }
  Dx /= n - 1;
  setValues(Mx, Dx, Math.pow(Dx, 1 / 2));
}

function exponentialDistribution() {
  let R1 = getLemeraElement();
  return (-1 * Math.log(R1)) / ly;
}

function estimateExponentialDistribution() {
  let Mx = 0,
    Dx = 0;
  Mx = 1 / ly;
  Dx = Math.pow(Mx, 2);
  setValues(Mx, Dx, Math.pow(Dx, 1 / 2));
}

function gammalDistribution() {
  let R1 = [];
  for (let i = 0; i < ny; i++) {
    R1.push(getLemeraElement());
  }
  let sum = 0;

  for (let i = 0; i < ny; i++) {
    sum += Math.log(R1[i]);
  }
  return (-1 * sum) / ly;
}

function estimateGammalDistribution() {
  let Mx = 0,
    Dx = 0;

  Mx = ny / ly;
  Dx = ny / Math.pow(ly, 2);

  setValues(Mx, Dx, Math.pow(Dx, 1 / 2));
}

function simpsonDistribution() {
  let R1, R2;
  R1 = getLemeraElement();
  R2 = getLemeraElement();

  return ((Math.max(aU, b) - Math.min(aU, b)) * (R1 + R2)) / 2 + aU;
}

function estimateSimpsonDistribution() {
  let Dx = 0;

  let Mx = (aU + b) / 2;
  Dx = Math.pow(b - aU, 2) / 24;

  setValues(Mx, Dx, Math.pow(Dx, 1 / 2));
}

function triangleDistribution() {
  let R1, R2;
  R1 = getLemeraElement();
  R2 = getLemeraElement();
  let X;
  X = aU + (b - aU) * Math.min(R1, R2);

  return X;
}

function setValues(mx, d, sko) {
  document.getElementById("MO").value = mx;
  document.getElementById("D").value = d;
  document.getElementById("MSD").value = sko;
}

function findMO(values) {
  mo = values.reduce((total, x) => total + x) / n;
  document.getElementById("MO").value = mo;
}

function findK(values) {
  let k = 0;
  for (let i = 0; i < values.length - 1; i += 2) {
    if (Math.pow(values[i], 2) + Math.pow(values[i + 1], 2) < 1) k++;
  }
  document.getElementById("k").value = (2 * k) / n;
}

function findP(values) {
  let count = 0;
  let xv = ((r * a) % m) / m;
  let i_arr = [];
  for (let i = 0; i < values.length; i++) {
    if (Math.abs(values[i] - xv) < 0.000001) {
      count++;
      i_arr.push(i);
      if (count == 2) break;
    }
  }
  if (i_arr.length == 2) {
    let p = i_arr[1] - i_arr[0];
    document.getElementById("p").value = p;
    return p;
  }
}

function findL(values, p) {
  let i3;
  for (let i = 0; i < values.length; i++) {
    if (Math.abs(values[i] - values[i + p]) < 0.00001) {
      i3 = i;
      break;
    }
  }
  document.getElementById("l").value = i3 + p;
}

function findDispersion(values) {
  let D = (document.getElementById("D").value =
    values.reduce((total, x) => total + Math.pow(x - mo, 2)) / (n - 1));

  document.getElementById("MSD").value = Math.pow(D, 1 / 2);
}

function getLemeraElement() {
  r = (r * a) % m;
  return r / m;
}

function algorithmLemera(a, m, n) {
  const result = [];
  for (let i = 0; i < n; i++) {
    result[i] = getLemeraElement();
  }
  return result;
}

function findMin(values) {
  let min = values[0];
  for (let i = 1; i < values.length; i++) {
    if (values[i] < min) {
      min = values[i];
    }
  }
  return min;
}

function findMax(values) {
  let max = values[0];
  for (let i = 1; i < values.length; i++) {
    if (values[i] > max) {
      max = values[i];
    }
  }
  return max;
}

const ctx = document.getElementById("histogram").getContext("2d");
const chart = new Chart(ctx, {
  type: "bar",
  data: {
    labels: [],
    datasets: [
      {
        data:[],
        backgroundColor: "blue",
      },
    ],
  },
  options: {
    scales: {
      xAxes: [
        {
          display: true,
        },
      ],
      yAxes: [
        {
          ticks: {
            beginAtZero: true,
          },
        },
      ],
    },
  },
});
function drawChart(values) {

  let min = findMin(values);
  let max = findMax(values);

  let ords = [];
  let arLabel = Array(k).fill(0);

  let r = max - min;
  let delta = r / k;


  for (let l = min; l <= max; l += delta) {
    let r = l + delta;
    let m = values.filter(
      (value) => value < r && (Math.abs(value - l) < 0.0001 || value > l)
    ).length;
    ords.push(m/n);
  }


   let x = min+delta;
   for (let i = 0; i < k; i++) {
       arLabel[i] = (arLabel[i] + x).toFixed(2);
     x += delta;
  }

  chart.data.labels=arLabel;
   chart.data.datasets[0].data=ords;
   chart.update();
}
