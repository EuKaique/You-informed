if(process.env.NODE_ENV == "production"){
    module.exports = {
        mongoURI: "mongodb+srv://kaique:<Banco_kaiqueDB>@cluster0.qxpwz.mongodb.net/YouInformed?retryWrites=true&w=majority"
    }
}else{
    module.exports = {
        mongoURI: "mongodb://localhost/YouInformed"
    }
}