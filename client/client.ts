declare let vis: any;

let currentGraph: any;

var loc = new URL(window.location.toString()) as any;
if (loc.searchParams.get("graph")) {
    fetch(`http://localhost:3000/graph/${loc.searchParams.get("graph")}/`).then(res => res.json()).then(graph => {
        render(graph);
        currentGraph = graph;
    });
}

// Attach event handlers
let graphInput = document.getElementById("graphInput") as HTMLInputElement;
let lastKeyFrame = new Date().valueOf();

document.addEventListener("keydown", e => {
    graphInput.focus();
}, false);

const DEBOUNCE_INTERVAL = 50; // ms
graphInput.addEventListener("input", e => {
    if (new Date().valueOf() - lastKeyFrame < DEBOUNCE_INTERVAL) {
        return;
    }
    lastKeyFrame = new Date().valueOf();


    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    fetch(`http://localhost:3000/nlp`, {
        credentials: "same-origin",
        method: "POST",
        body: JSON.stringify({text: graphInput.value}),
        headers: myHeaders
    })
    .then(res => res.json())
    .then((res: any) => {
        render(res.graph);
        currentGraph = res.graph;
    })
    .catch(e => {
        console.error(e);
        var editor_child = document.getElementById("editor")!.children[0];
        editor_child.parentNode!.removeChild(editor_child);
    });
});
let executeButton = document.getElementById("submitButton") as HTMLButtonElement;
executeButton.addEventListener("click", e => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
     fetch(`http://localhost:3000/run`, {
        credentials: "same-origin",
        method: "POST",
        body: JSON.stringify(currentGraph),
        headers: myHeaders
    }).then(res => res.json()).then(res => {
        alert("Successfully sent command");
    });
});

function render(g: any) {
    let graph = JSON.parse(JSON.stringify(g));
    var colors = ["#6EAC29", "#F9A11B", "#60C5BA", "#f26d5b", "#A593E0"];
    var nodeData = [];
    var idtrack = 0;
    for (var i = 0; i < Object.keys(graph).length; i++) {
        var key = Object.keys(graph)[i];
        if (!graph[key].plugin) {
            for (var j = 0; j < Object.keys(graph[key].output).length; j++) {
                var split = graph[key]["output"][Object.keys(graph[key].output)[j]].split('.');

                nodeData.push({
                    id: idtrack,
                    label: graph[key][split[1]],
                    color: colors[i % colors.length],
                    shape: "box"
                })
                graph[key]["output"][Object.keys(graph[key].output)[j]] = idtrack;
                idtrack++;
            }
        } else {
            nodeData.push({
                id: idtrack,
                label: graph[key]["plugin"],
                shape: 'circle',
                color: colors[i % colors.length]
            })
            graph[key].id = idtrack;
        }
        idtrack++;
    }
    console.log(nodeData);
    // create an array with nodes
    var nodes = new vis.DataSet(nodeData);
    var edgeData = [];
    for (var i = 0; i < Object.keys(graph).length; i++) {
        let val = graph[Object.keys(graph)[i]];
        for (var j = 0; j < Object.keys(val.output).length; j++) {
            if (!val.plugin) {
                var split2 = Object.keys(val.output)[j].split('.');
                var nodeTo = graph[split2[0]];
                edgeData.push({
                    arrows: 'to',
                    from: val["output"][Object.keys(val.output)[j]],
                    to: nodeTo.id
                });

            } else {
                var split3 = Object.keys(val.output)[j].split('.');
                var nodeTo = graph[split3[0]];
                edgeData.push({
                    arrows: 'to',
                    from: val.id,
                    to: nodeTo.id
                });
            }
        }
    }
    // create an array with edges
    var edges = new vis.DataSet(edgeData);

    // create a network
    var container = document.getElementById("editor");
    var data = {
        nodes: nodes,
        edges: edges
    };
    var options = {};
    new vis.Network(container, data, options);
}
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
