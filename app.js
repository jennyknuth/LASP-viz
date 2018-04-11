
// configuration for a line chart with error bars
var lineChartWithErrorBars = function (plot, variance, title){
  var chartConfig = {
    title: {
      text: title,
    },
    xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: {
          month: '%b \ %Y',
      },
      labels: {
        y: 25,
      }
    },
    yAxis: {
        title: {
          useHTML: true,
          text: 'W/m<sup>2</sup>'
        }
    },
    series: [
      {
        type: 'line',
        name: title,
        marker: {
          enabled: true,
          radius: 3,
        },
        data: plot,
      },
      {
        type: 'errorbar',
        name: 'uncertainty',
        data: variance,
      },
    ]
  };
  return chartConfig;
};

// array of some available data sets
var dataSets = [
  'tcte_tsi_24hr.jsond?time,tsi_true_earth,measurement_uncertainty_true_earth',
  'nrl2_observational_composite_tsi_v02r01.jsond?time,tsi,tsi_uncertainty'
];

// reusable attributes of data sets
function getPrefix (dataSet) {
  return dataSet.substr(0, dataSet.indexOf('.'));
}
function getUrl (dataSet) {
  return 'http://lasp.colorado.edu/lisird/latis/' + dataSet + '&stride(10) ';
}
function getTitlePath (dataSet) {
  var parameters = dataSet.slice(dataSet.indexOf('?'));
  var titleData = parameters.split(',')[1];
  return titleData;
}

// get reusable attributes of data sets
function getDataSetInfo (index) {
  return {
    prefix: getPrefix(dataSets[index]),
    url: getUrl(dataSets[index]),
    titlePath: getTitlePath(dataSets[index]),
  };
}

// event listener to change data sets
var counter = 0;
document.getElementById('next').addEventListener('click', function(){
     counter = (counter + 1) % 2;
     var currentDataSet = getDataSetInfo(counter);
     getData(currentDataSet);
});

getData(getDataSetInfo(0));

// get data for specified data set
function getData(dataSet) {
  axios.get(dataSet.url)
  .then(function (response) {
    var data = response.data[dataSet.prefix].data;

    // create time and tsi array
    var dataArray = data.map(function(item) {
      return [item[0], item[1]];
    });

    // create uncertainty array and preserve null values
    var uncertaintyArray = data.map(function(item) {
      var uncertainty_low = item[1] - item[2] ? item[1] - item[2] : null;
      var uncertainty_high = item[1] + item[2] ? item[1] + item[2] : null;
      return [item[0], uncertainty_low, uncertainty_high];
    });

    // use metadata from the data set to define the title, if available
    var title = response.data[dataSet.prefix].metadata[dataSet.titlePath].long_name ?
      response.data[dataSet.prefix].metadata[dataSet.titlePath].long_name : dataSet.titlePath.toUpperCase();

    // make chart in the DOM
    var myChart = Highcharts.chart('container', lineChartWithErrorBars(dataArray, uncertaintyArray, title));
  })
  .catch(function (error) {
  });
}
