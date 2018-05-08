// Ajax to update Chart.js data

// Flow Doughnut Chart
var ctx2 = document.getElementById("flow-chart");
var doughnut = new Chart(ctx2, {
  type: 'doughnut',
  data: {
    labels: ["vibration", "pressure"],
    datasets: [
      {
        label: "monitored variables",
        backgroundColor: ["rgb(255, 99, 132)","rgb(54, 162, 235)","rgb(255, 205, 86)"],
        data: [.20,.70]
      }
    ]
  },
  options: {
    title: {
      display: true,
      text: 'Monitoring'
    }
  }
});

// Asynchronous Update 
function updateFlowChart() {
  $.ajax({
    url: "/data/flow",
    data: {},
    type: "GET",
    dataType: "json",
    success: function (data) {
      console.log(data);
      // transform data into arrays for chart
      var values = [data["coeff1"], data["coeff2"]];
      var labels = ["vibration", "pressure"];
      // update doughnut chart
      doughnut.data.datasets[0].data = values;
      doughnut.data.datasets[0].labels = labels;
      doughnut.update();
      // update excpected value
      var expectedFlow = data["expect_flow"].toFixed(2);
      $('#expected-flow').html("Expected Flow " + expectedFlow);
    },
    error: function (xhr, status) {
      alert("Sorry, there was a problem!");
    },
    complete: function (xhr, status) {
      //$('#showresults').slideDown('slow')
    }
  });
}


// Power Line Chart
var ctx = document.getElementById("power-chart");
var powerChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ["0", "1", "2", "3", "4"],
    datasets: [{
      data: [81, 77, 82, 75, 80],
      lineTension: 0,
      backgroundColor: 'transparent',
      borderColor: '#007bff',
      borderWidth: 4,
      pointBackgroundColor: '#007bff'
    }]
  },
  options: {
    scales: {
      yAxes: [{
        ticks: {
          beginAtZero: false
        }
      }]
    },
    legend: {
      display: false,
    }
  }
});


// Asynchronous Update 
function updatePowerChart() {
  $.ajax({
    url: "/data/power",
    data: {},
    type: "GET",
    dataType: "json",
    success: function (data) {
      console.log(data);
      // transform data into arrays for chart
      var labels = [];
      var values = [];

      // get sorted keys and associated values
      Object.keys(data).sort().forEach(function(key) {
        if (key != "anomalous") {
          labels.push(key);
          values.push(data[key]);
        }
      });
      
      // update doughnut chart
      powerChart.data.datasets[0].data = values;
      powerChart.data.datasets[0].labels = labels;
      powerChart.update();

    },
    error: function (xhr, status) {
      alert("Sorry, there was a problem updating power chart!");
    },
    complete: function (xhr, status) {
      //$('#showresults').slideDown('slow')
    }
  });
}

// update every 2 seconds
setInterval(function(){
  updateFlowChart();
  updatePowerChart();
}, 2000);