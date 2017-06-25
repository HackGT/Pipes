declare let vis: any;

// create an array with nodes
  var nodes = new vis.DataSet([
    {id: 1, label: 'Node 1'},
    {id: 2, label: 'Node 2'},
    {id: 3, label: 'Node 3'},
    {id: 4, label: 'Node 4'},
    {id: 5, label: 'Node 5'}
  ]);

  // create an array with edges
  var edges = new vis.DataSet([
    {from: 1, to: 3},
    {from: 1, to: 2},
    {from: 2, to: 4},
    {from: 2, to: 5},
    {from: 3, to: 3}
  ]);

  // create a network
  var container = document.getElementById("editor");
  var data = {
    nodes: nodes,
    edges: edges
  };
  var options = {};
  var network = new vis.Network(container, data, options);

//   {
//     "text": {
//         "value": "this is a test of the Georgia Tech emergency notification system",
//         "language": "es",
//         "output": {
//             "translate_1.text": "text.value",
//             "translate_1.language": "text.language"
//         }
//     },
//     "translate_1": {
//         "instance": "Translate 1",
//         "plugin": "translate",
//         "output": {
//             "twitter_1.tweet":  "translate_1.translated"
//         }
//     },
//     "twitter_1": {
//         "instance": "hackgt twitter",
//         "plugin": "twitter",
//         "output": {}
//     }
// }