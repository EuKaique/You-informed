if(process.env.NODE_ENV == "production"){
    module.exports = {
        mongoURI: "mongodb+srv://kaique:<Banco_kaiqueDB>@cluster0.qxpwz.mongodb.net/YouInformed?retryWrites=true&w=majority"
        // mongodb + srv : // kaique : <password> @ cluster0.qxpwz.mongodb.net / <dbname> ? retryWrites = true & w = majoritário
    }
}else{
    module.exports = {
        mongoURI: "mongodb://localhost/YouInformed"
    }
}