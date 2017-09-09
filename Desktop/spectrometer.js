var express = require('express');
var five = require("johnny-five");
var fs = require("fs");
var board = new five.Board();
var app = express();
/* @led tableau contient les instances de LED crées avec J5*/
var led = [];

var led_default = '{ "led": ['+
	'{"couleur": "rouge", "lamba": 650, "angle": 140, "hex": "#FF5733", "borne": 11},' +
	'{"couleur": "jaune", "lamba": 580, "angle": 120, "hex": "#F1C40F", "borne": 7},' +
	'{"couleur": "vert", "lamba": 530, "angle": 100, "hex": "#27AE60", "borne": 6},' +
	'{"couleur": "bleu", "lamba": 470, "angle": 80, "hex": "#2471A3", "borne": 4},' +
	'{"couleur": "blanche", "lamba": 0, "angle": 60, "hex": "FFFFFF", "borne": 3} ]}';
/*@data_led obj prend la valeur led_default si pas de fichier /data/led.txt sauvegardé*/
var data_led;
/* utilisation d'un répertoire statique pour express*/
app.use(express.static(__dirname + '/css'));
/* middleware de gestion des adresses web*/
var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var clients = [];
/* @data_led tableau contient l'état de chaque LED 0 pour éteint 1 pour allumé*/
var led_etat = [];
/*@servo instance le l'object Servo de J5*/
var servo;
/*@photoresistor_valeur nombre valeur de la photoresistance*/
var photoresistor_valeur;
/*@resultat tableau photoresistor_valeur indexé par rapport au numero de led*/
var resultat = [];
/*@valeur_ref tableau vide si pas de fichier /data/reference.txt */
var valeur_ref = [];


/*Quand l'arduino MEGA est fonctionnelle*/
board.on("ready", function() {

 
/*On crée une instance J5 pour la photorésistance*/
  photoresistor = new five.Sensor({
    pin: "A3",
    freq: 250
  });
 /*Puis une isntance pour le moteur servo*/
	servo = new five.Servo({
    id: "mon_servo",     // User defined id
    pin: 12,           // Which pin is it attached to?
    type: "standard",  // Default: "standard". Use "continuous" for continuous rotation servos
    range: [0,180],    // Default: 0-180
    fps: 40,          // Used to calculate rate of movement between positions
    invert: false,     // Invert all specified positions
    startAt: 0,       // Immediately move to a degree
    center: true,      // overrides startAt if true and moves the servo to the center of the range
    });
    //servo.sweep();
/*Lancement de la session socket avec socket.io*/
	io.sockets.on('connection', function (socket) {
		  clients.push(socket.id);
		 // "data" get the current reading from the photoresistor
		  photoresistor.on("data", function() {
			  photoresistor_valeur = this.value;
	//		console.log(this.value);
			socket.emit('luminosite', this.value);
		  });
		   // Quand le serveur reçoit un signal de type "moteur" du client    
		  socket.on('moteur', function (message) {
				console.log('angle demandé : ' + message);				
				servo.to(message);
		  });
			
			
})	
/*Lecture du fichier reference qui contient les données de références de la dernière sauvegarde :
 * modification de valeur_ref*/
		fs.readFile(__dirname +'/data/reference.txt', 'utf8', function (err2, donnees2)
			{	
				if (err2){
				 console.log("le fichier reference.txt n'existe pas");
				  } 
				else{
				 valeur_ref = JSON.parse(donnees2);
				}						
/*Lecture du fichier led.txt qui contient les références de la racks de led : angulation, longueur onde...
 * modification de data_led*/								
				fs.readFile(__dirname +'/data/led.txt', 'utf8', function (err, donnees)
				{
					 if (err){
						 data_led = JSON.parse(led_default);
						 
						//throw new Error("Le fichier led.txt n'existe pas");
						} 
					 else{
						 data_led = JSON.parse(donnees);
						}
/*si chargement du programme, on remplit le tableau resultat avec des 0
 * */
					if(resultat.length == 0){
						data_led['led'].forEach(function(element) {					
						resultat.push(0);						
						})
					}
/*si chargement du programme on remplit le tableau valeur_ref : avec des 0 */
					if(valeur_ref.length == 0){
						data_led['led'].forEach(function(element) {					
						valeur_ref.push(0);						
						})
					}
/*lors du chargement du programme on met toutes les LED à 0 (éteinte)*/
					data_led['led'].forEach(function(element) {					
						led_etat.push(0);
												
					})
/*lors du chargement du programme, on crée une instance d'un object led de J5 dans un tableau*/
					// led 	
					for(i=0; i<data_led['led'].length; i++){
						console.log("tableau led "+i+"    "+data_led['led'][i]['borne']);
						led[i] = new five.Led(data_led['led'][i]['borne']); 
					}
/*bouton reboot*/
					app.get('/reboot', function(req, res) {					
							/*on éteint toutes les LED*/
							for(i=0; i<led_etat.length; i++){			      
							   console.log("mise à zero "+i);
								  led_etat[i]=0;
								  led[i].fadeOut();						 
							}		
							/*et mon affiche la page*/				
							res.render(__dirname+'/../views/mapage.ejs', {connect : "éteint", connect2 : "éteint", bouton : "Allumer", bouton2 : "Allumer", numero : 0, lien : "./changer_etat", data_led: data_led, resultat: resultat, valeur_ref: valeur_ref} );
											
					});  
/*afficher_resultat */	

					app.get('/afficher_resultat', function(req, res){
						/*on éteint toutes les LED*/
						for(i=0; i<led_etat.length; i++){			      
							   console.log("mise à zero "+i);
								  led_etat[i]=0;
								  led[i].fadeOut();						 
							}	
						/*on ouvre le fichier resultat et on le met dans le tableau resultat*/
						fs.readFile(__dirname +'/data/resultat.txt', 'utf8', function (err2, donnees3)
						{	
						if (err2){
							console.log("le fichier resultat.txt n'existe pas");
						}else{		
							resultat = JSON.parse(donnees3);										
							res.render(__dirname+'/../views/mapage.ejs', {connect : "éteint", connect2 : "éteint", bouton : "Allumer", bouton2 : "Allumer", numero : 0, lien : "./changer_etat", data_led: data_led, resultat: resultat, valeur_ref: valeur_ref} );
							}
						});
					});
/*accueil2*/
					app.get('/accueil2', function(req, res) {
						
						var verification = false;
						 for(i=0; i<led_etat.length; i++){						
						
								if(led_etat[i]==1){		
								verification = true;			 
								res.render(__dirname+'/../views/mapage.ejs', {connect : "allumé", connect2 : "éteint", bouton : "éteindre", bouton2 : "Allumer", numero : i, lien : "./changer_etat", data_led: data_led, resultat: resultat, valeur_ref: valeur_ref} );
								break;		 					
								}
						}
						
						if(	!verification){
							for(i=0; i<led_etat.length; i++){			      
							   console.log("mise à zero "+i);
								  led[i].fadeOut();						 
							 
							}						
							res.render(__dirname+'/../views/mapage.ejs', {connect : "éteint", connect2 : "éteint", bouton : "Allumer", bouton2 : "Allumer", numero : 0, lien : "./changer_etat", data_led: data_led, resultat: resultat, valeur_ref: valeur_ref} );
						}		
					
					});

					app.get('/changer_etat/:numero', function(req, res) {
						
						if(led_etat[req.params.numero]==0){						
						  led_etat[req.params.numero]=1;
						  for(i=0; i<data_led['led'].length; i++){					      
							   if(i!=req.params.numero){
								  led[i].fadeOut();
								  led_etat[i]=0; 
							   }
							}
						  led[req.params.numero].fadeIn();	
						  servo.to(data_led['led'][req.params.numero]['angle']);
						}else{						
							 led_etat[req.params.numero]=0;
						}					
						res.redirect('/accueil2'); 	
					});
					app.get('/sauvegarde_resultat/:cas', function(req, res) {
						
						var mon_json2 = JSON.stringify(resultat);
						var mon_adresse;
						if(req.params.numero == 1){
							mon_adresse = __dirname +"/data/reference.txt";
						}else{
							mon_adresse = __dirname +"/data/resultat.txt";
						}
						fs.writeFile(mon_adresse, mon_json2, function(err) {
							if(err) {
								return console.log(err);
							}
							console.log("The file was saved!");
						});
						
						 res.redirect('/accueil2'); 
						
					});
					
					app.get('/analyse', function(req, res) {
						var k = 0;		
						var led_mouvement = false;
						var led_allume = false;
						var mon_time = 0;	
						resultat = [];		
							console.log("valeur initiale de k"+k);					
						
						var myVar = setInterval(function(){						
							return mon_timer(k,led_mouvement, led_allume, mon_time);
							}, 1000);						
												
						servo.on('move:complete', function(){
									console.log("led en place "+k);
									if(k<data_led['led'].length){		
											
										led_allume = true;
										led_mouvement = false;
										led[k].fadeIn();
										var d = new Date();
										mon_time = d.getTime();	
									}else{
										console.log("erreur");
									}						
								} );
								
						function mon_timer(j, mouvement, allume, temps){
						console.log("valeur de j"+j);	
						if(j<data_led['led'].length){
							if(!mouvement && !allume){
								led_mouvement = true;
								servo.to(data_led['led'][j]['angle'], 1000);	
								console.log("led en mouvement "+j);
														
							}else if(allume){
								var d = new Date();
								var t = d.getTime();		
								if( (t-temps)/1000 >= 2 ){
									resultat[j] = photoresistor_valeur;			
									console.log("resultat "+data_led['led'][j]['couleur']+" : "+photoresistor_valeur);
									led_allume = false;
									led_mouvement = false;
									led[j].fadeOut();	
									
									
									k = j+1;
								}
								
							}					
						
						}else{
							
							 clearInterval(myVar);				
							 j= 0;
							 mouvement = false;
							 allume = false;				
							 res.redirect('/accueil2'); 
						}
						
					}
				});
					
					app.post('/sauvegarde_led', urlencodedParser, function(req, res) {		 
						 
						 var mon_json = '{ "led": [';
						 for (var i=0; i<5; i++){
							mon_json += '{ "couleur" : "'+req.body.couleur[i]+'", "lamba": '+req.body.lamba[i]+', "angle": '+req.body.angle[i]+', "hex": "'+req.body.hex[i]+'", "borne": '+req.body.borne[i]+' }'+(i!=4 ? ',' : '') +'';
						 }
						mon_json += ']}';
						console.log("sauvegarde demandée "+ mon_json);

						fs.writeFile(__dirname +"/data/led.txt", mon_json, function(err) {
							if(err) {
								return console.log(err);
							}
							console.log("The file was saved!");
						}); 
						data_led = JSON.parse(mon_json);
						console.log("id "+clients[0]);
						io.emit('alerte', "Les données ont été sauvegardées.");
						for(i=0; i<led_etat.length; i++){			      
								  led_etat[i]=0; 
								  led[i].fadeOut();						 
							 
							}	
						for(i=0; i<data_led['led'].length; i++){
							console.log("tableau led "+i+"    "+data_led['led'][i]['borne']);
							led[i] = new five.Led(data_led['led'][i]['borne']); 
						}
						res.redirect('/accueil2'); 
					});
					
					app.use(function(req, res, next){
						res.setHeader('Content-Type', 'text/plain');
						res.send(404, '404 : Page introuvable !');
					});
				
				
				
				
			
		 });   
	 
   });
 
});
				   app.get('/', function(req, res) {					
						
							for(i=0; i<led_etat.length; i++){			      
							   console.log("mise à zero "+i);
								  led_etat[i]=0;
								  led[i].fadeOut();						 
							}						
							res.render(__dirname+'/../views/index.ejs', {connect : "éteint", connect2 : "éteint", bouton : "Allumer", bouton2 : "Allumer", numero : 0, lien : "./changer_etat", data_led: data_led, resultat: resultat, valeur_ref: valeur_ref} );
											
					});

  // Chargement de socket.io
	var server = require('http').createServer(app);  
	var io = require('socket.io').listen(server);

server.listen(8080);
