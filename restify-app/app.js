//this is definitely standard
//standard protocol to require restify
var restify = require('restify');
var server = restify.createServer();

//additional sequelize code
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

//setup restify
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());
server.use(restify.plugins.bodyParser());

//setup the mysql configuration
const sql = new Sequelize('trello', 'root', 'danae123', {
	host: 'localhost',
	port: 3306,
	dialect: 'mysql',
	operatorsAliases: false,
	pool: {
		max: 5,
		min: 0,
		acuire: 30000,
		idle: 10000
	}
});

//make the connection
sql
	.authenticate()
	.then(() => {
		console.log("The connection was successful!");
	})
	.catch(err => {
		console.log("There was an error when connecting!");
	});


//set up swimlane table
var Swimlane = sql.define('swimlanes', {
	id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
	name: { type: Sequelize.STRING }
});


//***set up card table
var Card = sql.define('cards', {
	id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV4 },
	name: { type: Sequelize.STRING },
	cardDescription: { type: Sequelize.STRING }
});



//***set up sql associations
//Card.Swimlane = Card.belongsTo(Swimlane);
Swimlane.hasMany(Card);
Card.belongsTo(Swimlane);

sql.sync();

//the force flag will drop the tables if they exist and recreate them - NOT FOR PRODUCTION
// sql.sync({ force: true }).then(() => {
// 	getSwimlanes();
// });

// //static swimlanes to make sure render on page when command lines express/restify started, localhost:3000
// let swimlanes = [{
// 		"id": 1,
// 		"name": "swimlane 1",

// 	},
// 	{
// 		"id": 2,
// 		"name": "swimlane 2",
// 	}
// ];

// //static cards rendering on webpage
// let cards = [{
// 		"id": 1,
// 		"swimlane_id": 1,
// 		"name": "card 1",
// 		"cardDescription": "description 1"
// 	},
// 	{
// 		"id": 2,
// 		"swimlane_id": 2,
// 		"name": "card 2",
// 		"cardDescription" : "description 2"
// 	}
// ];

// //Constructor for swimlanes
// var Swimlane = function(id, name){
// 	this.id = id;
// 	this.name = name;
// }

// //Constructor for cards
// var Card = function(id, swimlane_id, name, cardDescription){
// 	this.id = id;
// 	this.swimlane_id = swimlane_id;
// 	this.name = name;
// 	this.cardDescription = cardDescription;
// }

//gets swimlanes passing in request, response, next [where does it use them]
function getSwimlanes(req, res, next) {
	// Restify currently has a bug which doesn't allow you to set default headers
	// These headers comply with CORS and allow us to serve our response to any origin
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");

	//find the appropriate data
	Swimlane.findAll().then((Swimlane) => {
		res.send(Swimlane);
	});
	// res.send(swimlanes);
}

//***gets cards passing in request, response, next [where does it use them]
function getCards(req, res, next) {
	// Restify currently has a bug which doesn't allow you to set default headers
	// These headers comply with CORS and allow us to serve our response to any origin
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");

	//find the appropriate data
	Card.findAll().then((Card) => {
		res.send(Card);
	});
	// res.send(cards);
}

//posts swimlanes passing in request, response, next
function postSwimlane(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");

	console.log(req.body);

	Swimlane.create({
		id: req.body.id,
		name: req.body.name
	}).then((swimlane) => {
		res.send(swimlane);
	});
}
	// var swimlane = new Swimlane(req.body.id, req.body.name);

	// swimlanes.push(swimlane);

	// res.send(swimlane);


//***posts cards passing in request, response, next - needs to know from ajax in express lower case swimlane id
function postCard(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");

	console.log(req.body);

	Swimlane.find({
  		where: {
    		id: req.body.swimlane_id}
	})
	.then((swimlane) => {
		Card.create({
			id: req.body.id,
			name: req.body.name,
			cardDescription: req.body.cardDescription
		}).then((card) => {
			card.setSwimlane(swimlane);
			res.send(card);
		});
	});
	// var card = new Card(req.body.id, req.body.swimlane_id, req.body.name, req.body.cardDescription);

	// cards.push(card);

	// // save the new message to the collection

	// res.send(card);
}


function getCardsBySwimlaneId (req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");

	console.log(req.params)

	Card.findAll({
            where: { swimlaneId: req.params.swimlane_id }
        })
        .then((Card) => {
            res.send(Card);
        });
}


function updateSwimlaneById (req, res, next) {
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Headers", "X-Requested-With");
//get swimlaneid from url
var swimlaneId = req.params.swimlane_id;
//get newswimlane name from body
var name = req.body.name;
//find swimlane by swimlane id
Swimlane.find({
        where: { id: swimlaneId }
    }).then((swimlane) => {
        if (swimlane) {
	//update name for swimlane
            swimlane.updateAttributes({
                name: name
            })
        }
//return swimlane to caller
        res.send(swimlane);
    });
}


//need to change names to card
function updateCardById (req, res, next) {
res.header("Access-Control-Allow-Origin", "*");
res.header("Access-Control-Allow-Headers", "X-Requested-With");
//get swimlaneid from url
var card_id = req.params.card_id;
//get newswimlane name from body
Card.find({
        where: { id: card_id }
    }).then((card) => {
        if (card) {
	//update card name property
            if (req.body.name) {
                card.updateAttributes({
                    name: req.body.name
                });
            }
            if (req.body.description) {
                card.updateAttributes({
                    cardDescription: req.body.description
                });
            }
        }
	//return card to caller
        res.send(card);
    });
}

function removeSwimlane(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");

    // get swimlaneId from URL
    var swimlaneId = req.params.swimlane_id;
    var card_id = req.params.card_id;


    Swimlane.find({
        where: { id: swimlaneId }
    }).then((swimlane) => {

    	var cards = swimlane.getCards().then((cards) => {
    		for(var i = 0; i < cards.length; i++){
    			cards[i].destroy();
    		}

        	swimlane.destroy();
    	});
    	res.send(200);
	});
}

function removeCards(req, res, next){
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");


    var card_id = req.params.card_id;

    Card.find({
        where: { id: card_id }
    }).then((card) => {

        card.destroy();
    });

    res.send(200);
}


// Set up our routes and start the server
server.opts('/swimlanes/:swimlane_id', (req, res) =>{
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Headers', 'Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.send(200);
});

server.opts('/swimlanes/cards/:card_id', (req, res) =>{
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Headers', 'Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.send(200);
});

server.get('/swimlanes', getSwimlanes);
server.post('/swimlanes', postSwimlane);

server.get('/swimlanes/:swimlane_id/cards', getCardsBySwimlaneId);
server.post('/swimlanes/:swimlane_id', updateSwimlaneById);


server.get('/cards', getCards);
server.post('/cards', postCard);
server.post('/swimlanes/cards/:card_id', updateCardById)


server.del('/swimlanes/:swimlane_id', removeSwimlane);
server.del('/swimlanes/cards/:card_id', removeCards);

server.listen(8080, function() {
	console.log('%s listening at %s', server.name, server.url);
});
