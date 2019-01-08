// include shuffle.js
function run() {
  let results = {
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0
  };
  const runs = 100000;
  // print results
  console.log("distribution: " + JSON.stringify(distribution));
  console.log("percentages: " +  JSON.stringify(percentages));
  for (let i = 0; i < runs; i++) {
    let chosen = choose();
    let value = results[chosen] + 1;
    results[chosen] = value;
  }
  for(key in results) {
    console.log(key + ": " + parseFloat(results[key] / runs));
  }
}

function reset() {
  distribution = {
    "1": [0.0, 0.1],
    "2": [0.11, 0.3],
    "3": [0.31, 0.7],
    "4": [0.71, 0.9],
    "5": [0.9, 1.0]
  }
  percentages = {
    "1": 0.1,
    "2": 0.2,
    "3": 0.4,
    "4": 0.2,
    "5": 0.1
  }
}

function testShuffle(){
  run();
  reset();

  // for(let a = 1; a < 6; a ++) {
  //   for (let b = 1; b < 5; b++) {
  //    scaleDistribution(a);
  //     for (let c = 1; c < 4; c++) {
  //      scaleDistribution(b);
  //       for ( let d = 1; d < 3; d++) {
  //         scaleDistribution(c);
  //         for (let e = 1; e < 2; e++) {
  //           scaleDistribution(d);
  //           run();
  //           reset();
  //         }
  //       }
  //     }
  //   }
  // }

  // console.log("rm 4");
  // scaleDistribution(4);
  // run();
  // reset();

  console.log("rm 3");
  scaleDistribution(3);
  run();
  reset();

  console.log("rm 3 , 1");
  scaleDistribution(3);
  scaleDistribution(1);
  run();
  reset();
}
testShuffle();