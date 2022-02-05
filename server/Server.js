const express = require( 'express' )
const mongoose = require( 'mongoose' )
const dotenv = require( 'dotenv' )
const helmet = require( 'helmet' )
const bodyParser = require( "body-parser" );
const morgan = require( 'morgan' )
const cors = require( 'cors' )
const userRoutes = require( './src/routes/userRouter' )
const chatRoutes = require( './src/routes/chatRouter' )
const messageRoutes = require( './src/routes/messageRoutes' )
const {notFound, errorHandler} = require( "./src/middleware/errorMiddleware" );
const app = express()

dotenv.config()
//connecting MongoDb
mongoose.connect(
	process.env.DATABASE_ACCESS, {useNewUrlParser: true, useUnifiedTopology: true},
	() => {
		console.log( "Database Connected" )
	} )
//middleware
app.use( bodyParser.json() )
//to accept JSON data
app.use( express.json() )
app.use( express.urlencoded( {extended: true} ) )
app.use( helmet() )
app.use( morgan( "common" ) )
app.use( cors() )
app.options( '*', cors() );
const allowCrossDomain = function (req, res, next) {
	res.header( 'Access-Control-Allow-Origin', '*' );
	res.header( 'Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE' );
	res.header( 'Access-Control-Allow-Headers', 'Content-Type' );
	next();
};
app.use( allowCrossDomain );

//routes

app.get( "/", (req, res) => {
	res.json( {message: "Welcome to  application."} );
} );
app.use( "/api/user", userRoutes )
app.use( "/api/chat", chatRoutes )
app.use( "/api/message", messageRoutes )

//error handlers
app.use( notFound )
app.use( errorHandler )

const PORT = process.env.PORT || 4000
const server = app.listen( PORT, () => console.log( `Server is running at port ${PORT}` ) )


const io = require( 'socket.io' )( server, {
	pingTimeout: 60000,
	cors: {
		origin: "*"
	}
} );
io.on( "connection", (socket) => {
	console.log( "Connected to Socket.io" )
	socket.on( "setup", (userData) => {
		socket.join( userData._id );
		socket.emit( 'connected' )
	} );
	socket.on( 'join chat', (room) => {
		socket.join( room );
		console.log( "user joined room:" + room )
	} )

	socket.on( 'typing', (room) => socket.in( room ).emit( "typing" ) )
	socket.on( 'stop typing', (room) => socket.in( room ).emit( "stop typing" ) )

	socket.on( 'new message', (newMessageReceived) => {
		let chat = newMessageReceived.chat;

		if (!chat.users) return console.log( "chat.users not defined" )
		//not to send same message back to the sender
		chat.users.forEach( user => {
			if (user._id === newMessageReceived.sender._id) return;
			socket.in( user._id ).emit( "message received", newMessageReceived )
		} )
	} )
} )
