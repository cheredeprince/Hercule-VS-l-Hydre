var partInt= function(n){
    if(n==1){
        return [1];
    }else{
        var cptPart = [1,2,3,5,7,11,15,22,30,42];
        if(n<11){
            if(Math.random()<(1/cptPart[n-1])){
                return [n];
               }
        }
            // un nombre entre 1 et n-1
        var k = 1+ Math.floor(Math.random() *(n-1));
        var part = partInt(n-k);
        part.push(k);
        return part;
    }
};

sigma.classes.graph.addIndex('nodesCount', {
  constructor: function() {
    this.nodesCount = 0;
  },
    clear: function() {
	this.cutCount = 1;
  },
  addNode: function() {
    this.nodesCount++;
  }
});


sigma.classes.graph.addIndex('edgesCount', {
  constructor: function() {
    this.edgesCount = 0;
  },
  clear: function() {
    this.cutCount = 1;
  },
  addNode: function() {
    this.edgesCount++;
  }
});

sigma.classes.graph.addMethod('getNodesCount', function() {
  return this.nodesCount;
});

sigma.classes.graph.addMethod('addHead',function(father){
    var id = 'n'+this.nodesCount,
	fatherNode = this.nodesIndex[father];
    this.addNode({
        id : id,
        size: 10,
        x: fatherNode.x + Math.random(),
        y: fatherNode.y + Math.random(),
	type: 'image'
    });
    return id;
});

sigma.classes.graph.addMethod('addJonction',function(settings){
    var id = 'n'+this.nodesCount;
    this.addNode({
        id : id,
        size: 2,
	color: '#639726',
        x: settings.x,
        y: settings.y
    });
    return id;
});

sigma.classes.graph.addMethod('addNeck',function(settings){
    this.addEdge({
        id : 'e'+ this.edgesCount,
	size : 2,
	color: '#8E963F',
	source : settings.source,
	target : settings.target
    });
});


sigma.classes.graph.addMethod('copyNode',function(source,place){
    var g = this,
        outNeighborsIndex = this.outNeighborsIndex,
        i;
    var aux = function(s,p){
        var child, target;
	if(Object.keys(outNeighborsIndex[s]).length != 0){
	    var pNode = g.nodesIndex[p];
            target = g.addJonction({
		x: pNode.x,
		y: pNode.y
            });
	}else{
	    target = g.addHead(p);
	}

        g.addNeck({
            source: p,
            target: target
        });

        for(child in outNeighborsIndex[s]){
            aux(child,target,0);
        }
    };
    for(i=0;i<g.cutCount;i++){
       aux(source,place);
    }
});

sigma.classes.graph.addMethod('cutHead',function(nodeId){
    var inNeighborsIndex = this.inNeighborsIndex,
        edge,
        dad,
        grandDad,
	g = this;
    for(dad in inNeighborsIndex[nodeId]){
        g.dropNode(nodeId);
        for(grandDad in inNeighborsIndex[dad]){
            g.copyNode(dad,grandDad);
        }
	// si le père n'a plus d'enfants
	if(g.degree(dad,'out') == 0 && dad != 'n0'){
	    g.dropNode(dad);
	    var target = g.addHead(grandDad);
	    g.addNeck({
		source: grandDad,
		target : target
	    });
	}
    }
});

sigma.classes.graph.addIndex('cutCount', {
  constructor: function() {
    this.cutCount = 1;
  },
  clear: function() {
    this.cutCount = 1;
  },
  cutHead: function() {
    this.cutCount++;
  }
});

sigma.classes.graph.addIndex('headCount', {
  constructor: function() {
    this.headCount = 0;
  },
  clear: function() {
    this.headCount = 0;
  },
  addHead: function() {
    this.headCount++;
  },
  cutHead: function() {
    this.headCount--;
  }
});

sigma.classes.graph.addMethod('getHeadCount',function(){
    return this.headCount;
});

sigma.classes.graph.addMethod('getCutCount',function(){
    return this.cutCount;
});

var s = new sigma();

s.settings({
    doubleClickEnabled: false,
    enableHovering: false,
    drawlabels: false,
    maxNodeSize: 40,
    maxEdgeSize: 5
});

s.addRenderer({
  type: 'canvas',
  container: 'container'
});

var graph= s.graph;

var genHydre = function(n){
    graph.clear();
    var subHydre = function(source,k){
        var childrenNumber = partInt(k),
            i;
        if(childrenNumber.length == 1){
            for(i=0; i<childrenNumber[0];i++){
                
                var target = graph.addHead(source);

                graph.addNeck({
                    source: source,
                    target: target
                });
            }
        }else{
            for(i=0; i<childrenNumber.length;i++){
                var target;
                // si on a pas une feuille
                if( childrenNumber[i] !=1){
                    target = graph.addJonction({
			x: Math.random(),
			y: Math.random()
                    });
		}else
		    target = graph.addHead(source);

                graph.addNeck({
                    source: source,
                    target: target
                });
	
                // si on a pas une feuille
                if( childrenNumber[i] !=1)
		    subHydre(target,childrenNumber[i]);
            }
        }
    }
    
    graph.addNode({
        id : 'n0',
        color: '#79AB1A',
        size: 20,
        x:0,
        y:0,
	type: 'image',
	corps: true
    });
    subHydre('n0',n);
}


var headInput = document.getElementById('head-number'),
    button    = document.getElementById('run-button'),
    winMessage= document.getElementById('win-message'),
    headCpt   = document.getElementById('head-cpt'),
    cutCpt    = document.getElementById('cut-cpt'),
    navCheck  = document.getElementById('navcheck');
    

var forceConfig = {
    gravity : 0.01,
    startingIterations: 2
};

var run = function(){
    
    var headNumber = parseInt(headInput.value) || 5;
    if(s.isForceAtlas2Running()){
	s.killForceAtlas2();
    }
    winMessage.innerHTML = '';
    navCheck.checked = false;
    genHydre(headNumber);
    updateCompteur();
    s.startForceAtlas2(forceConfig);
    //setTimeout(function(){s.stopForceAtlas2();},5000);
};

var updateCompteur= function(){
    headCpt.innerHTML = s.graph.getHeadCount();
    cutCpt.innerHTML = s.graph.getCutCount() -1;
}

var isFinish = function(){
    if(s.graph.nodes().length == 1){
	winMessage.innerHTML = 'Tu remportes la victoire! <br/> Aurais-tu gagné si l\'Hydre avez eu une tête de plus ?';
    }
};

run();

button.addEventListener('click', function(e){
    run();
},false);

s.bind("clickNode",function(event){
    //console.log(event.data.node);
    var node = event.data.node;
    if(graph.degree(node.id,'out') == 0 && node.id != 'n0'){
	
	// on rétablit le curseur
	document.body.style.cursor = "default";

	s.killForceAtlas2();
	graph.cutHead(event.data.node.id);
	//setTimeout(function(){s.refresh();s.startForceAtlas2();},500);
	s.refresh();
	s.startForceAtlas2(forceConfig);
	//setTimeout(function(){s.stopForceAtlas2();},50*graph.nodes().length);

	//afficher quelque chose en cas de fin
	isFinish();
	
	updateCompteur();
    }
});

s.bind("overNode",function(event){
    var node = event.data.node;
    if(graph.degree(node.id,'out') == 0){
	document.body.style.cursor = "url(sword.png), auto";
    }
});


s.bind("outNode",function(event){
    var node = event.data.node;
    if(graph.degree(node.id,'out') == 0){
	document.body.style.cursor = "default";
    }
});
