/* HTML Primary Attribute */
var WIDTH;
var HEIGHT;
var canvas;
var context;

var totalBall = 35;
var ball = [];

var mouseIdle = 0;
var mouseVx = 1.5;
var mouseVy = 1.5;
var mouseX;
var mouseY;
var mouseProx = 200;

//Mask Canvas for Light
var maskCanvas;
var maskContext;


$(document).ready(function(){
	GetWindowSize();

	/* Get Mouse Position */
	$(document).mousemove(function(event){
		mouseX = event.pageX;
		mouseY = event.pageY;
		mouseIdle = 0;
	});
	$(document).mousedown(function(event){
		var chr = Math.floor(GDRandom(1,ball.length-1));
		ball[chr].constructor();
		ball[chr].x = event.pageX;
		ball[chr].y = event.pageY;
	});


	/* First Spawn */
	Start();
	/* Call Update Function */
	Update();
});

/* GUI Function */
function GetWindowSize()
{
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;
	$('#container').width(WIDTH).height(HEIGHT);
	canvas = document.getElementById('canvas');
	$(canvas).attr('width',WIDTH).attr('height',HEIGHT);
	context = canvas.getContext('2d');

	/* This is for mask canvas */
	maskCanvas = document.createElement('canvas');
	maskCanvas.width = WIDTH;
	maskCanvas.height = HEIGHT;
	maskContext = maskCanvas.getContext('2d');

}

/* Additional Function */
function playSoundFx(sound)
{
	var sound = new Audio("Sound/"+sound); // buffers automatically when created
	sound.play();
}
function GDRandom(min,max)
{
	return Math.floor(Math.random() * (max - min + 1)) + min;  
}
/* Calculate FPS */
var lastCalledTime;
var fps;
function CalculateFPS()
{
	if(!lastCalledTime) 
	{
    	lastCalledTime = Date.now();
    	fps = 0;
    	return;
	}
	delta = (Date.now() - lastCalledTime)/1000;
 	lastCalledTime = Date.now();
	fps = 1/delta;
	if(Math.round(lastCalledTime)%60==1)
		console.log (Math.round(fps) + " fps");
}
function Start()
{
	context.beginPath();
	context.fillStyle = "black";
	context.fillRect(0,0,WIDTH,HEIGHT);
	context.fill();
	context.closePath();

	for(var i=0;i<totalBall;i++)
	{
		ball.push(new Ball());
		ball[i].constructor();
	}
}

function Update()
{
	//GetWindowSize();

	context.clearRect(0,0,WIDTH,HEIGHT);
	context.beginPath();
	context.fillStyle = "black";
	context.fillRect(0,0,WIDTH,HEIGHT);
	context.fill();
	context.closePath();

	for(var i=0;i<ball.length;i++)
	{
		ball[i].update();
		ball[i].render();	
	}
	//**
	CollisionChecker(true);
	LineCreator(true);

	mouseIdle += .1;
	if(Math.round(mouseIdle)>=10)
	{
		if(mouseX < 0 || mouseX > WIDTH-1)
			mouseVx*=-1;
		if(mouseY < 0 || mouseY > HEIGHT-1)
			mouseVy*=-1;

		mouseX+=mouseVx;
		mouseY+=mouseVy;
	}
	//LightXorMasking();

	//CalculateFPS();
	requestAnimationFrame(Update);
}

function Ball()
{
	this.constructor = function()
	{
		this.x = Math.random()*WIDTH;
		this.y = Math.random()*HEIGHT;
		this.r = Math.random()*10;
		//this.r = 2;

		//Natural Movement
		this.time = GDRandom(30,100);
		this.deg = GDRandom(-179,180);
		this.vel = GDRandom(1,5);
		this.curve = GDRandom(0,1);
		this.fade = GDRandom(0,1);
		this.grow = GDRandom(-1,1);

		//Colour
		this.red = GDRandom(0,255);
		this.green = GDRandom(0,255);
		this.blue = GDRandom(0,255);
		this.c = "rgba("+this.red+","+this.green+","+this.blue+","+this.fade+")";
	}
	this.update = function()
	{
		dx = this.vel * Math.cos(this.deg * Math.PI/180);
        dy = this.vel * Math.sin(this.deg * Math.PI/180);

		this.x += dx;
		this.y += dy;

		if(this.x + this.r < 0)
			this.x += WIDTH-1;
		else 
			this.x %= WIDTH-1;
		if(this.y + this.r < 0)
			this.y += HEIGHT-1;
		else 
			this.y %= HEIGHT-1;

		this.calcAll();

	}	
	this.calcAll = function()
	{

		if (!this.time) 
        {
            //Natural Movement
			this.time = GDRandom(30,100);
			this.deg = GDRandom(-179,180);
			this.vel = GDRandom(1,5);
			this.curve = GDRandom(0,1);
			this.fade = GDRandom(0,1);
			this.grow = GDRandom(-2,2);
        }        

		//Calc Grow
		if(this.grow > 0)
			this.r = Math.min(30,this.r+.1);
		else
			this.r = Math.max(10,this.r-.1);

		//Calc Curve
		if(this.curve > 0)
			this.deg += 2;
		else 
			this.deg -= 2;

		//Calc Opacity
		if(this.fade > 0)
			this.fade = Math.max(.3,this.fade-.01);
		else
			this.fade = Math.min(1,this.fade+.01);
		

		//Calc Timer
		if(this.vel < 1) 
			this.time = 0;
		else 
			this.vel -= .05;

	}
	this.render = function()
	{
		context.beginPath();
		context.arc(this.x,this.y,this.r,Math.PI*2,false);
		this.c = "rgba("+this.red+","+this.green+","+this.blue+","+this.fade+")";
		context.fillStyle = this.c;
		context.fill();
		context.closePath();
	}
}
function CollisionChecker(stats)
{
	if(stats)
	{
		for(var i=0;i<ball.length;i++)
		{
			for(var j=0;j<ball.length && j!=i;j++)
			{
				var dx = ball[i].x - ball[j].x;
				var dy = ball[i].y - ball[j].y;
				var dst = Math.sqrt(dx*dx + dy*dy);	

				if(dst < ball[i].r + ball[j].r + mouseProx)
				{
					context.beginPath();
					context.moveTo(ball[i].x,ball[i].y);
					context.lineTo(ball[j].x,ball[j].y);
					//Gradient
					var grd=context.createLinearGradient(ball[i].x,ball[i].y,ball[j].x,ball[j].y);
					grd.addColorStop(0,"rgba("+ball[i].red+","+ball[i].green+","+ball[i].blue+","+Math.abs(dst-(mouseProx + ball[i].r + ball[j].r ))/100+")");
					grd.addColorStop(1,"rgba("+ball[j].red+","+ball[j].green+","+ball[j].blue+","+Math.abs(dst-(mouseProx + ball[i].r + ball[j].r ))/100+")");
					//grd.addColorStop(0,"rgba("+ball[i].red+","+ball[i].green+","+ball[i].blue+","+1+")");
					//grd.addColorStop(1,"rgba("+ball[j].red+","+ball[j].green+","+ball[j].blue+","+1+")");

					context.strokeStyle = grd;
					context.lineWidth = 1;
					context.stroke();
				}
				/*
				if(dst < ball[i].r + ball[j].r)
				{
					//console.log(ball[i]," ~ ",ball[j]);
					if(ball[i].r > ball[j].r){
						ball.splice(j,1);
						ball.push(new Ball());
						ball[ball.length-1].constructor();
					}
					else if(ball[i].r < ball[j].r){
						ball.splice(i,1);
						ball.push(new Ball());
						ball[ball.length-1].constructor();
					}
					return;
				}
				*/
			}	
		}
	}
	
}
function LineCreator()
{
	for(var i=0;i<ball.length;i++)
	{
		var dx = ball[i].x - mouseX;
		var dy = ball[i].y - mouseY;
		var dst = Math.sqrt(dx*dx + dy*dy);	

		if(dst < ball[i].r + mouseProx)
		{
			context.beginPath();
			context.moveTo(mouseX,mouseY);
			context.lineTo(ball[i].x,ball[i].y);

			context.strokeStyle = "rgba("+ball[i].red+","+ball[i].green+","+ball[i].blue+","+Math.abs(dst-mouseProx)/100+")";

			context.lineWidth = 1;
			context.stroke();
		}
	}	
}
function LightXorMasking()
{
	maskContext.clearRect(0,0,maskCanvas.width,maskCanvas.height);
	maskContext.beginPath();
	maskContext.fillStyle = "black";
	maskContext.fillRect(0,0,maskCanvas.width,maskCanvas.height);
	maskContext.globalCompositeOperation = 'xor';
	maskContext.arc(mouseX,mouseY,mouseProx,Math.PI*2,false);

	maskContext.fill();
	context.drawImage(maskCanvas,0,0);
}