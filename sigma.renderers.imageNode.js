var img = new Image();
img.src = "head.png";
var corps = new Image();
corps.src = "corps.png";
sigma.canvas.nodes.image = function(node, context, settings) {
    var prefix = settings('prefix') || '';
    context.fillStyle = node.color || settings('defaultNodeColor');
    if(node.corps){	
	context.drawImage(corps,node[prefix +'x']-20,node[prefix +'y']-20);
    }else
	context.drawImage(img,node[prefix +'x']-5,node[prefix +'y']-17.5);

};
